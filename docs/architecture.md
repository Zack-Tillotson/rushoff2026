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
    avatarId: string
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
(first visit, or a genuinely new browser/device), it shows the name+avatar form and
creates the record at that uid. A brand-new anonymous uid (e.g. a truly different device)
has no path back to an old family's data — that's an accepted limitation given the event
is same-day/same-device in practice, not a cross-device account system.

## No Content Data Source Needed
Unlike iteration 2 (which needed a story template + word pools transcribed into
`src/data/adlib.ts`), this redesign has **no variable content per clue at all** — finding
a clue just flips a found/not-found flag. There's nothing to source, generate, write, or
license. `src/data/adlib.ts` is deleted; the only static config left is the clue list
itself (`stations.ts`) and the generic avatar set (`avatars.ts`).

## Pages / Routes (App Router)

| Route | Purpose |
|---|---|
| `/` | Home: shows the shared race clock **only once it's running/stopped** — before the organizer starts it, shows a simple "hasn't started yet" message instead of a "0:00". Also shows this family's status (name/avatar, X/5 main + Y/2 secret found) and nav into the rest. |
| `/start` | Start QR lands here. Signs in anonymously if not already, then checks `/families/{uid}`: if it exists, redirect straight to `/`; if not, show the name+avatar form and create the record at that uid. |
| `/station/[stationId]` | Clue QR lands here. `stationId` is one of `'1'`–`'7'` (main clues `1`–`5`, extra-secret clues `6`–`7`) — pre-rendered via `generateStaticParams` (required for the static export). If `/families/{uid}` doesn't exist yet, redirect to `/start?returnTo=/station/[id]`. Shows a simple "found it" confirmation with a button; tapping writes `catches/{id}` with just a timestamp. Idempotent — if already found, shows "Already found!" instead of a button, no re-roll (there's nothing to re-roll). |
| `/collection` | This family's found-so-far list across all 7 clues, with separate main (X/5) and extra-secret (Y/2) counts — no story/word language, since there's no story anymore. |
| `/map` | Shows `course-map.png` as-is — no pins, no overlays, no per-clue positioning. Tapping it opens the raw image in a new tab so the phone's native image viewer handles pinch-zoom. |
| `/compare` | Shared view of all families and which of the 7 clues they've found — main-clue completion, extra-secret finds, cross-family comparison. |
| `/finish` | Finish QR lands here. If `/families/{uid}` doesn't exist, redirect to `/start?returnTo=/finish` same as any clue. Idempotent — first scan sets `finishedAt` and shows the welcome-to-the-gang screen (X/5 main + Y/2 secret found); re-scanning just re-shows the same welcome screen. Grants no new find — it's a "you're in" celebration, not another catch. |
| `/admin` | Organizer-only. Passcode-gated (see Security). Clock start/stop/reset, live table of every family + which clues found, manual toggle-a-clue-found/unfound, manually mark a family as finished, and rendered QR codes for the start URL + all 7 clues + finish. |

Mobile-first layout with an MUI `BottomNavigation` (Home / Map / Collection / Compare) for
family-facing pages; `/admin` is a separate, unlinked layout not reachable from that nav.
`/start`, `/station/[id]`, and `/finish` also hide the bottom nav (single-purpose,
QR-landed flows) but include a small "back to home" link so there's still a way back
into the app if the phone's browser/QR-scanner view has no visible back button.

## Real-time Sync
Small hooks wrapping Firebase's `onValue`:
- `useAuthUid()` → ensures `signInAnonymously()` has completed and returns the current
  uid (or `null` while loading). Every other hook builds on this.
- `useRaceClock()` → `{ status, startedAt, stoppedAt }`, with a local `setInterval` tick
  to recompute elapsed display time between DB updates (avoids a write every second).
- `useFamily()` → live view of `/families/{useAuthUid()}` (used by `/collection`; by
  `/station/[id]` to check for an existing find; and by `/finish` to check `finishedAt`
  for idempotency and to read all 7 catches for the found-counts on the welcome screen).
- `useAllFamilies()` → live list of every family, for `/compare` and `/admin`.

All plain hooks — no global store, and no custom family-identity context needed since
the Firebase Auth SDK itself is the source of truth for "who am I on this device."

## Admin QR Codes
- `qrcode.react`'s `<QRCode value={url} />` renders real, scannable QR codes directly in
  `/admin` — one for `/start`, one per clue (`/station/1` through `/station/7`), and one
  for `/finish` (9 total), each pointing at the actual deployed URL
  (`window.location.origin` + path).
- Doubles as the source for the physical printed clues too — screenshot or print
  straight from this admin view instead of using an external QR-generator site.
- Purely client-side rendering (SVG/canvas), no network dependency beyond the page
  itself already having loaded.

## Security
Given the scale (~8 groups, private family event, one afternoon), security is
intentionally minimal — optimize for "ships and works," not for resisting tampering:
- **Firebase Anonymous Auth** signs in every client on load, purely as a convenient
  source of a stable per-device id (used as the `/families/{uid}` key) — not as an
  access-control mechanism. No login UI either way.
- **RTDB rules are fully open** (`.read: true`, `.write: true`) for the week of the
  event. No per-uid write scoping, no special-cased admin uid. This sidesteps the
  fragile "hardcode the organizer's anonymous uid into the rules" scheme entirely — the
  admin device just writes like any other client, gated only by a client-side passcode
  on the `/admin` route itself (an env var checked in the browser) to deter casual
  stumbling-in.
- **Accepted risk**: anyone could open devtools and write anything — fake a find, mess
  with the clock, forge another family's record. Given the audience (family) and the
  one-day lifespan of the data, this is accepted outright rather than engineered around.
  Lock the rules down (or just delete the database) after race day.
- **Deliberately deferred**: RTDB `.validate` schema rules, and transactional/atomic
  writes for the find flow to guard against double-tap races. At ~8 families this class
  of bug is unlikely to occur even once, and if it does, the admin's manual-correction
  feature is the fix — cheaper than building prevention for a scenario this rare. (This
  matters even less now than in iteration 2 — with no randomness, a double-tap just
  writes the same "found" timestamp twice, which is harmless.)
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
`AppBar`, `BottomNavigation`, `Card` (finish welcome, themed per above), `Avatar`
(family avatar, rope-framed), `LinearProgress` (main-clue completion), `Table`/
`DataGrid`-lite (admin + compare), `Snackbar` (toasts, e.g. "clue marked found").

## Deployment
- `next build` (with `output: 'export'` in `next.config`) produces a static `out/`
  directory.
- `firebase.json` hosting config points at `out/` as the public directory — plain static
  file hosting, no framework integration/Cloud Functions involved.
- `firebase deploy --only hosting` deploys it.
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
    compare/page.tsx
    finish/page.tsx                # finish QR lands here — welcome-to-the-gang screen, sets finishedAt
    admin/
      page.tsx                    # passcode gate
      AdminDashboard.tsx           # clock controls, live family table, manual find/finish toggles
      AdminQrCodes.tsx             # qrcode.react grid for start + 7 clue URLs + finish
    BackToHomeLink.tsx             # small nav-escape-hatch link, used on start/station/finish
    WantedPosterCard.tsx           # shared parchment/rope reveal-card component
    layout.tsx                    # MUI ThemeProvider, CssBaseline, BottomNavigation
  data/
    stations.ts                   # 7 clues: id ('1'-'7'), kind ('main'|'secret') — no map-position data
    avatars.ts                    # generic avatar set
  lib/
    firebase.ts                   # Firebase app/RTDB/Auth init
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
