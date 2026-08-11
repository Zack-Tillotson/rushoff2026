# Rush Off 5k — Architecture

Implementation design for the requirements in `requirements.md`. Assumes Next.js
(App Router) for the app and Material UI (MUI) as the component/design system, deployed
as a **static export to Firebase Hosting** and backed by Firebase Realtime Database for
shared state.

## Stack
- **Next.js** (App Router), built as a **static export** (`output: 'export'`) and served
  as plain static files from **Firebase Hosting** — no Cloud Functions, no SSR, no
  Firebase billing/runtime beyond static file serving. All 7 clue ids are known at
  build time, so `/station/[stationId]` uses `generateStaticParams` to pre-render each
  one (with `export const dynamicParams = false`) — this is the one real constraint a
  static export imposes, and it's a non-issue here since the clue list is fixed.
  All shared state lives in Firebase Realtime Database and is read/written directly from
  the browser via the Firebase JS SDK.
- **MUI** (`@mui/material` + `@mui/icons-material`) for all UI — `ThemeProvider` +
  `CssBaseline` at the root layout, a small custom theme (see Theming below).
- **Firebase**: Hosting (static files) + Realtime Database (shared state) + Anonymous
  Auth, used purely as a convenient per-device unique id (see Security below).
- **`qrcode.react`** to render actual scannable QR codes client-side in the admin view
  (start URL + all 7 clue URLs + the finish URL) — no external QR-generation service
  needed.
- **State/data access**: no Redux/Zustand needed at this scale — a handful of small
  custom hooks wrapping Firebase's `onValue` listeners. No React Context needed either;
  the Firebase Auth SDK itself is the source of truth for "who am I on this device."

## Data Model (Realtime Database)

```
/race
  /clock
    status: "idle" | "running" | "stopped"
    startedAt: <server timestamp | null>
    stoppedAt: <server timestamp | null>
    # elapsed = (stoppedAt ?? now) - startedAt, computed client-side

/families
  /{familyId}
    name: string
    createdAt: <server timestamp>
    finishedAt: <server timestamp | null>   # set when the finish QR is scanned
    catches:
      /{stationId}
        caughtAt: <server timestamp>
        manual: boolean   # true if added via admin manual-correction
```

This is deliberately simpler than iteration 2's model: a clue is either found or it
isn't, with no variable payload (no word, no item, nothing random) — so `catches/{id}`
just needs a timestamp and a manual-correction flag. There's no `foundId` anymore
because there's nothing to look up; existence of the `catches/{stationId}` node *is*
the found state.

`finishedAt` is a nice free bonus: paired with the shared race clock's `startedAt`, it
gives each family an unofficial "your time was X:XX" moment at the welcome screen —
just for fun tension, not official timing (per Out of Scope).

Everything else — the list of clue ids (`'1'`–`'7'`) and which are "main" vs.
"extra-secret" — is **static config shipped with the app** (`src/data/stations.ts`),
not stored in the database. It never changes at runtime, so there's no reason to pay
for a DB round-trip to read it. (No map-position data anymore — the map page just shows
the course image as-is, no per-clue coordinates needed; see Pages/Routes below.)

`familyId` **is the Firebase Anonymous Auth UID**, not a separately-generated key. Every
device signs in anonymously on first load (`signInAnonymously()`); Firebase persists that
identity in the browser itself (its own local storage), so a returning visit on the same
device/browser keeps the same uid automatically — no custom `localStorage` bookkeeping or
family-id plumbing needed. `/start` simply checks whether `/families/{auth.currentUser.uid}`
already exists: if yes, the device is recognized and skips straight through; if no
(first visit, or a genuinely new browser/device), it shows the name form and
creates the record at that uid. A brand-new anonymous uid (e.g. a truly different device)
has no path back to an old family's data — that's an accepted limitation given the event
is same-day/same-device in practice, not a cross-device account system.

## No Content Data Source Needed
Unlike iteration 2 (which needed a story template + word pools transcribed into
`src/data/adlib.ts`), this redesign has **no variable content per clue at all** — finding
a clue just flips a found/not-found flag. There's nothing to source, generate, write, or
license. `src/data/adlib.ts` is deleted; the only static config left is the clue list
itself (`stations.ts`).

## Pages / Routes (App Router)

| Route | Purpose |
|---|---|
| `/` | Home: shows the shared race clock **only once it's running/stopped** — before the organizer starts it, shows a simple "hasn't started yet" message instead of a "0:00". Also shows this family's status (name, X/5 main + Y/2 secret found) and nav into the rest. |
| `/start` | Start QR lands here. Signs in anonymously if not already, then checks `/families/{uid}`: if it exists, redirect straight to `/`; if not, show the name form and create the record at that uid. |
| `/station/[stationId]` | Clue QR lands here. `stationId` is one of `'1'`–`'7'` (main clues `1`–`5`, extra-secret clues `6`–`7`) — pre-rendered via `generateStaticParams` (required for the static export). If `/families/{uid}` doesn't exist yet, redirect to `/start?returnTo=/station/[id]`. **No button** — visiting the page is enough: a `useEffect` writes `catches/{id}` (just a timestamp) automatically on first load if not already found, then shows the celebratory confirmation. Idempotent — a repeat visit skips the write and shows "already found" copy instead of the celebratory copy (see Auto-Record on Visit below for how it tells the two apart). |
| `/collection` | This family's found-so-far list across all 7 clues, with separate main (X/5) and extra-secret (Y/2) counts — no story/word language, since there's no story anymore. |
| `/map` | Shows `course-map.png` as-is — no pins, no overlays, no per-clue positioning. Tapping it opens the raw image in a new tab so the phone's native image viewer handles pinch-zoom. |
| `/finish` | Finish QR lands here. If `/families/{uid}` doesn't exist, redirect to `/start?returnTo=/finish` same as any clue. Idempotent — first scan sets `finishedAt` and shows the welcome-to-the-gang screen (X/5 main + Y/2 secret found, secret count omitted entirely if zero — see Extra-Secret Clue Secrecy below); re-scanning just re-shows the same welcome screen. Grants no new find — it's a "you're in" celebration, not another catch. Also shows the family's own elapsed finish time. |
| `/admin` | Organizer-only. Unlisted URL only, no passcode (see Security). Clock start/stop/reset, live table of every family + which clues found, manual toggle-a-clue-found/unfound, manually mark a family as finished, and rendered QR codes for the start URL + all 7 clues + finish. |

Mobile-first layout with an MUI `BottomNavigation` (Home / Map / Collection) for
family-facing pages; `/admin` is a separate, unlinked layout not reachable from that nav.
`/start`, `/station/[id]`, and `/finish` also hide the bottom nav (single-purpose,
QR-landed flows) but include a small "back to home" link so there's still a way back
into the app if the phone's browser/QR-scanner view has no visible back button.

**No cross-family comparison view.** `/compare` existed earlier in this iteration but
was removed — there is no page where families see each other's progress or finish
times side-by-side. A family only ever sees its own state (`/collection`, `/finish`);
the organizer still sees everyone's progress, but only in `/admin`.

## Auto-Record on Visit
`/station/[id]` records a find automatically on page load — no confirmation button.
Just scanning the QR (which lands on this page) is the whole interaction:
- A `useState<boolean | null>` snapshots whether the clue **was already found before
  this visit**, captured once when `family` first resolves — this is the only way to
  distinguish "just found it now" (show the celebratory line) from "found it on a
  previous visit" (show the "already found" line), since after the auto-write both
  look identical in the database.
- If that snapshot is `false` (wasn't found before), the same effect fires the write —
  `set(catches/{id}, { caughtAt: Date.now() })` — immediately, no user action between
  landing on the page and the write happening.
- If it's `true` (already found), no write happens at all; the page just shows the
  "already found" copy. Idempotent, same as the old button-based flow, just without the
  button.
- This removes one interaction step from the physical hunt: a parent scans, glances at
  the phone, and that's it — no "now tap this too" second action standing between the
  scan and credit being recorded.

## Real-time Sync
Small hooks wrapping Firebase's `onValue`:
- `useAuthUid()` → ensures `signInAnonymously()` has completed and returns the current
  uid (or `null` while loading). Every other hook builds on this.
- `useRaceClock()` → `{ status, startedAt, stoppedAt }`, with a local `setInterval` tick
  to recompute elapsed display time between DB updates (avoids a write every second).
- `useFamily()` → live view of `/families/{useAuthUid()}` (used by `/collection`; by
  `/station/[id]` to check for an existing find; and by `/finish` to check `finishedAt`
  for idempotency and to read all 7 catches for the found-counts on the welcome screen).
- `useAllFamilies()` → live list of every family, used by `/admin` only now
  (`/compare`, its other consumer, was removed — see Pages/Routes above).

All plain hooks — no global store, and no custom family-identity context needed since
the Firebase Auth SDK itself is the source of truth for "who am I on this device."

## Finish Time
`caughtAt` (per clue) and `finishedAt` were already timestamped in the data model —
showing a family their own elapsed time needed no data-model change, just surfacing
what was already recorded:
- `src/lib/finishTime.ts` exports `getFinishTimeMs(family, clock)`, returning
  `family.finishedAt - clock.startedAt` in ms, or `null` if either is missing **or the
  result would be negative**. Negative happens when a family's `finishedAt` predates the
  *current* clock epoch — e.g. the admin reset/restarted the clock after that family had
  already finished — and would otherwise render a nonsensical result like `-8:-42`.
  Treating it as `null` (same as "hasn't finished") sidesteps that instead of trying to
  reconcile stale finish times against a new clock epoch.
- `src/lib/formatElapsed.ts` (`M:SS` string) is shared by `/` and `/finish` — previously
  duplicated inline on the home page only.
- `/finish` shows the family's own time via this helper. That's the only place it's
  shown — since `/compare` was removed, there's no cross-family time comparison
  anywhere in the app; `getFinishTimeMs`/`formatElapsed` remain useful (and are kept)
  purely for this single-family display.
- This is a fun personal stat, not official race timing (per Out of Scope).

## Extra-Secret Clue Secrecy
Per this revision's redesign, secret clues 6/7 must never be mentioned to a family
until they've actually found one — no "0/2 extra-secret clues" line, no placeholder
card revealing a hidden category exists:
- `/collection` builds its rendered card list as `[...MAIN_STATIONS,
  ...SECRET_STATIONS.filter(found)]` — an unfound secret clue simply never appears as a
  card, rather than appearing as a dimmed "?" placeholder (which was the iteration-3
  behavior before this fix, and did leak that 2 secret clues exist). The summary line
  ("`{secretFound}/2` extra-secret clues found") is only rendered when `secretFound > 0`.
- `/` (home) and `/finish` apply the same `secretFound > 0` gate to their secret-clue
  summary line/phrase.
- Once a family finds *one* secret clue, the count and that clue's card start showing —
  a still-undiscovered second secret clue stays unmentioned even then (the gate is
  per-family-state, not a one-time reveal-everything trigger).

## Admin QR Codes
- `qrcode.react`'s `<QRCode value={url} />` renders real, scannable QR codes directly in
  `/admin` — one for `/start`, one per clue (`/station/1` through `/station/7`), and one
  for `/finish` (9 total), each pointing at the actual deployed URL
  (`window.location.origin` + path).
- Doubles as the source for the physical printed clues too — screenshot or print
  straight from this admin view instead of using an external QR-generator site.
- Purely client-side rendering (SVG/canvas), no network dependency beyond the page
  itself already having loaded.
- **Single column, stacked** — `/admin` is a phone-first tool, and a multi-column grid
  of QR codes is fiddly to scan through on a narrow screen. Each row is a `Paper` with
  the code beside its label/path, not a grid cell.

## Admin Family List
`/admin`'s family list is a **stack of cards, one per family** — not a table. A
horizontal table with a column per clue (7 clues + name + finished = 9 columns) doesn't
fit a phone screen without horizontal scrolling, which is exactly the failure mode this
avoids. Each card has the family's name and a Finished/Racing chip up top, then a
wrapped row of `Chip`s — one per clue, filled+colored if found (with a trailing `*` if
manually corrected) or outlined if not — so the full 7-clue status is always visible at
a glance with no scrolling in either direction, at the cost of being less scannable as
a grid than a table would be for eyeballing many families at once (an acceptable
tradeoff at ~8 families). This is the organizer's only view of every family's
progress — there's no family-facing equivalent (see "No cross-family comparison view"
above).

## Security
Given the scale (~8 groups, private family event, one afternoon), security is
intentionally minimal — optimize for "ships and works," not for resisting tampering:
- **Firebase Anonymous Auth** signs in every client on load, purely as a convenient
  source of a stable per-device id (used as the `/families/{uid}` key) — not as an
  access-control mechanism. No login UI either way.
- **RTDB rules are fully open** (`.read: true`, `.write: true`) for the week of the
  event. No per-uid write scoping, no special-cased admin uid. This sidesteps the
  fragile "hardcode the organizer's anonymous uid into the rules" scheme entirely — the
  admin device just writes like any other client.
- **`/admin` has no passcode** — an earlier client-side passcode gate (an env var
  checked in the browser) was removed as unnecessary friction on top of an already-
  unlisted URL. It never was real security (a passcode baked into the client bundle
  isn't one) — it only deterred casual stumbling-in, which the unlisted URL alone
  already does at this scale.
- **Accepted risk**: anyone could open devtools and write anything — fake a find, mess
  with the clock, forge another family's record. Given the audience (family) and the
  one-day lifespan of the data, this is accepted outright rather than engineered around.
  Lock the rules down (or just delete the database) after race day.
- **Deliberately deferred**: RTDB `.validate` schema rules, and transactional/atomic
  writes for the find flow to guard against duplicate-write races (e.g. the auto-record
  effect firing more than once for the same visit). At ~8 families this class of bug is
  unlikely to occur even once, and if it does, the admin's manual-correction feature is
  the fix — cheaper than building prevention for a scenario this rare. With no
  randomness and no button, a duplicate write just re-writes the same "found" timestamp,
  which is harmless.
- Firebase web config (`apiKey`, etc.) is **not a secret** either way — it's meant to be
  public in client bundles.

## Theming & Art Direction (MUI)
The goal is for the whole app to read as *one* branded thing — an Old West outlaw-gang
tryout you're interacting with — not a generic Material app with themed copy pasted in.
That means establishing the look once, structurally, rather than hand-styling each page
and hoping it stays consistent. This direction is unchanged from iteration 2 — the theme
*simplification* was about the mechanic (dropping the story/word system), not about the
visual identity, which still fits well.

### Visual language
Take cues from the real event logo (`public/horse-mascot-purple.png`): bold black ink
line-art, a rope-circle badge motif, vintage rodeo-flyer/wanted-poster energy. Even
though the logo itself isn't wired in yet (per the earlier decision to hold off), the
*style* it represents — hand-drawn, high-contrast, slightly rugged — is the reference
point for everything else.

### Typography
- A bold Western/vintage **display font for headings and the finish welcome moment
  only** — "Rye" (via `next/font/google`, already wired up). Never body text.
- Body text, buttons, and anything read at a glance (the race clock, clue instructions)
  stay on the default clean sans-serif. Outdoor legibility in direct sunlight matters
  more than flourish for anything functional.

### Color palette
- Keep the existing high-contrast, sunlight-legible bias. Palette values live as MUI
  theme tokens (not hardcoded hex), so switching the primary color later (e.g. to the
  logo's purple) is a one-line change in `theme.ts`.
- Simplified from iteration 2: no more per-horse-named palette (there are no horses
  anymore). Just **two accent colors** — one for main clues (1–5), one for extra-secret
  clues (6–7) — since clues no longer have individual identities worth distinguishing
  by color.

### Iconography & motifs
- Swap default MUI icons for themed equivalents at the highest-visibility spots only —
  bottom nav, key action buttons. Default MUI icons are fine everywhere else.
- A **rope-border frame** (echoing the logo's rope circle) as a recurring motif — used
  on the finish-welcome card especially, since that's the highest-emotion moment.

### The finish welcome screen (the highest-emotion moment)
With the story-reveal twist gone, the finish-line welcome-to-the-gang moment is now
*the* emotional peak of the app — it deserves the most art-direction attention of
anything in the build:
- Parchment/wanted-poster card background, rope border, Western display type for the
  "You're one of us now!" headline and the found-clue counts.
- Should feel like being handed an actual gang membership — simple, warm, celebratory,
  not a mystery being unveiled (that was iteration 2's framing; this one's a party, not
  a twist).

### Implementation approach
Establish these choices once in `theme.ts` plus the shared `<WantedPosterCard>`
component (unchanged from iteration 2) rather than hand-styling each page.

### Scope tiers, given the build timeline
- **Must-have**: display-font headings, the two-color clue palette, the rope-border
  card treatment on the finish welcome screen.
- **Nice-to-have if time allows**: custom themed iconography beyond nav, parchment
  texture elsewhere in the app.

### Key MUI components
`AppBar`, `BottomNavigation`, `Card` (finish welcome, themed per above), `LinearProgress` (main-clue completion), `Chip` (admin
family-list clue status, per Admin Family List above), `Snackbar` (toasts, e.g. "clue
marked found"). No `Table` anywhere in the app now that `/compare` is gone — admin uses
cards instead (see Admin Family List above).

## Deployment
- `next build` (with `output: 'export'` in `next.config`) produces a static `out/`
  directory.
- `firebase.json` hosting config points at `out/` as the public directory — plain static
  file hosting, no framework integration/Cloud Functions involved.
- **`cleanUrls: true` is required** in the hosting config. Next's static export emits
  `start.html`, `admin.html`, `station/1.html`, etc. (not `start/index.html` per
  route) — without `cleanUrls`, Firebase Hosting only serves exact filename matches, so
  every route except `/` 404s. This was caught during the first real deploy (every
  route but the home page returned 404 on the live site) and fixed by adding the flag.
- `firebase deploy --only hosting` deploys it. **Live at
  https://rushoff2026.web.app.**
- Realtime Database rules (fully open, per Security above) and Anonymous Auth are
  configured directly in the Firebase console, or via `firebase deploy --only database`
  using `database.rules.json` if it's easier to keep that in version control.

## Directory Sketch
```
src/
  app/
    page.tsx                      # /
    start/page.tsx
    station/[stationId]/page.tsx
    collection/page.tsx
    map/page.tsx                  # course-map.png shown as-is, tap to open full-size for native zoom
    finish/page.tsx                # finish QR lands here — welcome-to-the-gang screen, sets finishedAt
    admin/
      page.tsx                    # no gate — just renders AdminDashboard directly
      AdminDashboard.tsx           # clock controls, per-family cards (not a table), manual find/finish toggles
      AdminQrCodes.tsx             # qrcode.react, single column, for start + 7 clue URLs + finish
    BackToHomeLink.tsx             # small nav-escape-hatch link, used on start/station/finish
    WantedPosterCard.tsx           # shared parchment/rope reveal-card component
    layout.tsx                    # MUI ThemeProvider, CssBaseline, BottomNavigation
  data/
    stations.ts                   # 7 clues: id ('1'-'7'), kind ('main'|'secret') — no map-position data
  lib/
    firebase.ts                   # Firebase app/RTDB/Auth init
    finishTime.ts                 # getFinishTimeMs() — negative-time-safe, used by /finish only
    formatElapsed.ts               # shared M:SS formatter (/, /finish)
    hooks/
      useAuthUid.ts
      useRaceClock.ts
      useFamily.ts
      useAllFamilies.ts
  theme.ts                        # MUI theme + main/secret clue accent colors
database.rules.json                 # optional, for version-controlling the open RTDB rules
```

## Resolved
- **Map**: the course image shown as-is, no pins/overlays, no map library, no GPS —
  tap-to-open-fullsize for native pinch-zoom instead of building custom zoom/pan.
- **Reveal animation**: plain CSS/MUI transitions only. No animation library.
- **QR codes**: rendered in-app via `qrcode.react` (admin view), not a manual external
  tool.
- **Finish**: a dedicated QR-gated route — the welcome-into-the-gang moment has a clear
  trigger.
- **No content/word/item data needed per clue**: this redesign's core simplification —
  a clue is just found or not, with no variable payload to generate, store, or reveal.
- **Hobby-horse count**: fixed at one per person, unconditionally — not derived from
  the app's data at all.
- **Finish QR as a single point of failure**: closed by the admin's manual
  mark-as-finished control.
- **Station ids**: plain numeric strings `'1'`–`'7'` — no thematic naming (no horse
  names, no letter prefixes) per the simplify-the-theme decision.
- **Admin passcode**: removed. An unlisted URL is the only access control for `/admin`
  now — judged sufficient at this scale, and the passcode was overkill on top of it.
- **Finish time**: surfaced via `getFinishTimeMs()` on `/finish` only, using timestamps
  (`caughtAt`, `finishedAt`) that were already being recorded — no data-model change
  needed, just display.
- **Admin mobile UX**: QR grid is single-column/stacked, and the family list is cards
  (one per family, wrapped clue chips) instead of a 9-column table — both driven by
  `/admin` being used on the organizer's phone in the field, where a wide grid or table
  would force horizontal scrolling.
- **No `/compare` route**: removed along with its bottom-nav entry. There is no
  family-facing cross-family comparison anywhere in the app anymore — only the
  organizer (via `/admin`) sees every family's progress.
- **No confirmation button on `/station/[id]`**: visiting the page is enough — the
  find is recorded automatically. Removes a second physical step (scan, then also tap)
  from every clue interaction. See Auto-Record on Visit above.
