# Rush Off 5k — Architecture

Implementation design for the requirements in `requirements.md`. Assumes Next.js
(App Router) for the app and Material UI (MUI) as the component/design system, deployed
as a **static export to Firebase Hosting** and backed by Firebase Realtime Database for
shared state.

## Stack
- **Next.js** (App Router), built as a **static export** (`output: 'export'`) and served
  as plain static files from **Firebase Hosting** — no Cloud Functions, no SSR, no
  Firebase billing/runtime beyond static file serving. All 7 station ids are known at
  build time, so `/station/[stationId]` uses `generateStaticParams` to pre-render each
  one (with `export const dynamicParams = false`) — this is the one real constraint a
  static export imposes, and it's a non-issue here since the station list is fixed.
  All shared state lives in Firebase Realtime Database and is read/written directly from
  the browser via the Firebase JS SDK.
- **MUI** (`@mui/material` + `@mui/icons-material`) for all UI — `ThemeProvider` +
  `CssBaseline` at the root layout, a small custom theme (see Theming below).
- **Firebase**: Hosting (static files) + Realtime Database (shared state) + Anonymous
  Auth, used purely as a convenient per-device unique id (see Security below).
- **`qrcode.react`** to render actual scannable QR codes client-side in the admin view
  (start URL + all 7 station URLs + the finish URL) — no external QR-generation service
  needed anymore.
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
        foundId: string
        caughtAt: <server timestamp>
        manual: boolean   # true if added via admin manual-correction
```

`foundId` is deliberately generic (renamed from `wordId`) — it holds a word id for the
5 horse stations, or a treasure-item id for the 2 gold-cache stations. Same shape either
way; only the client-side meaning differs based on the station's config.

`finishedAt` is a nice free bonus: paired with the shared race clock's `startedAt`, it
gives each family an unofficial "your time was X:XX" moment at the reveal — just for fun
tension, not official timing (per Out of Scope).

Everything else — the list of stations (id, name, isBonus, optional `blankType` for the
5 horse stations, position on the static map image as a percentage x/y or area radius),
the ~10-word pool per horse / ~4-item pool per gold cache, the default value per blank
type, the story template, and the generic avatar set — is **static config shipped with
the app** (TypeScript/JSON under `src/data/`), not stored in the database. It never
changes at runtime, so there's no reason to pay for a DB round-trip to read it.

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

## Word & Treasure Data Source
No external asset source needed anymore (unlike iteration 1's Pokemon sprites, or the
horse-art problem an earlier draft of this theme would have created) — the ad-lib story
template, the 5 horse word pools + defaults, and the 2 gold-cache item pools are all
plain text, transcribed directly from `docs/adlib-words.md` into `src/data/adlib.ts`.
Nothing to source, generate, or license.

## Pages / Routes (App Router)

| Route | Purpose |
|---|---|
| `/` | Home: shared race clock (read-only), status of your own family, nav into the rest |
| `/start` | Start QR lands here. Signs in anonymously if not already, then checks `/families/{uid}`: if it exists, redirect straight to `/`; if not, show the name+avatar form and create the record at that uid. |
| `/station/[stationId]` | Clue QR lands here. `stationId` is one of the 7 known ids — 5 horse stations (`adjective`, `pluralnoun`, `verb`, `sound`, `number`) + 2 gold-cache stations (`gold1`, `gold2`) — pre-rendered via `generateStaticParams` (required for the static export). If `/families/{uid}` doesn't exist yet, redirect to `/start?returnTo=/station/[id]`. If already found by this family, show the existing find (idempotent — re-scanning never re-rolls). Otherwise: random pick from the station's pool, write to DB, play the reveal animation. Horse stations show "you found [Horse]'s secret command word: '[word]'!"; gold-cache stations show "you found a hidden gold cache: [item]!" — neither ever mentions a story or a blank. |
| `/collection` | This family's found-so-far list (which horse words, which gold caches) — the everyday "check our progress" view during the race. Framed the same way as the stations themselves (no story/blank language) — the ad-lib nature stays a secret until `/finish`. |
| `/map` | Static course-image placeholder (organizer-supplied image later) with icons for the 5 horse stations positioned by percentage x/y, and a general area (not an exact icon) for the 2 gold-cache stations. No GPS, no live location — see Resolved below for why. |
| `/compare` | Shared view of all families and what they've found — full-story completion, gold-cache finds, cross-family duplicates. |
| `/finish` | Finish QR lands here. If `/families/{uid}` doesn't exist, redirect to `/start?returnTo=/finish` same as any station. Idempotent like stations — first scan sets `finishedAt` and shows the big final reveal: the twist that this was an ad-lib all along, with the 5 horse words (or their fixed defaults, for anything missed) filled into the template, ending in the universal fixed catchphrase (not sourced from any station). Re-scanning just re-shows that same reveal. Grants no new word/treasure, and is unrelated to gold-cache finds — it's a "reveal the story" action, not another catch. |
| `/admin` | Organizer-only. Passcode-gated (see Security). Clock start/stop/reset, live table of every family + word/gold-cache found, manual add/correct-a-catch, and rendered QR codes for the start URL + all 7 stations + finish. |

Mobile-first layout with an MUI `BottomNavigation` (Home / Map / Collection / Compare) for
family-facing pages; `/admin` is a separate, unlinked layout not reachable from that nav.

## Real-time Sync
Small hooks wrapping Firebase's `onValue`:
- `useAuthUid()` → ensures `signInAnonymously()` has completed and returns the current
  uid (or `null` while loading). Every other hook builds on this.
- `useRaceClock()` → `{ status, startedAt, stoppedAt }`, with a local `setInterval` tick
  to recompute elapsed display time between DB updates (avoids a write every second).
- `useFamily()` → live view of `/families/{useAuthUid()}` (used by `/collection`, and by
  `/station/[id]` to check for an existing catch before rolling a new one).
- `useAllFamilies()` → live list of every family, for `/compare` and `/admin`.

All plain hooks — no global store, and no custom family-identity context needed since
the Firebase Auth SDK itself is the source of truth for "who am I on this device."

## Admin QR Codes
- `qrcode.react`'s `<QRCode value={url} />` renders real, scannable QR codes directly in
  `/admin` — one for `/start`, one per station, and one for `/finish` (9 total), each
  pointing at the actual deployed URL (`window.location.origin` + path).
- Doubles as the source for the physical printed clues too — screenshot or print
  straight from this admin view instead of using an external QR-generator site,
  replacing iteration 1's "generate by hand on a free online tool" plan.
- Purely client-side rendering (SVG/canvas), no network dependency beyond the page
  itself already having loaded — works even if tested offline once the page is cached.

## Security
Given the scale (~8 groups, private family event, one afternoon) and the Friday deadline,
security is intentionally minimal — optimize for "ships and works," not for resisting
tampering:
- **Firebase Anonymous Auth** signs in every client on load, purely as a convenient
  source of a stable per-device id (used as the `/families/{uid}` key) — not as an
  access-control mechanism. No login UI either way.
- **RTDB rules are fully open** (`.read: true`, `.write: true`) for the week of the
  event. No per-uid write scoping, no special-cased admin uid. This sidesteps the
  fragile "hardcode the organizer's anonymous uid into the rules" scheme entirely — the
  admin device just writes like any other client, gated only by a client-side passcode
  on the `/admin` route itself (an env var checked in the browser) to deter casual
  stumbling-in.
- **Accepted risk**: anyone could open devtools and write anything — fake a catch, mess
  with the clock, forge another family's record. Given the audience (family) and the
  one-day lifespan of the data, this is accepted outright rather than engineered around.
  Lock the rules down (or just delete the database) after race day.
- **Deliberately deferred, not needed for Friday**: RTDB `.validate` schema rules, and
  transactional/atomic writes for the catch flow to guard against double-tap races. At
  ~8 families this class of bug is unlikely to occur even once, and if it does, the
  admin's manual-catch-correction feature is the fix — cheaper than building prevention
  for a scenario this rare.
- Firebase web config (`apiKey`, etc.) is **not a secret** either way — it's meant to be
  public in client bundles.

## Theming (MUI)
- Base theme with light/dark support optional (outdoor daytime use — bias toward high
  contrast, legible in direct sunlight; avoid pure white backgrounds that wash out).
- Per-horse accent colors (Sundance, Comet, Phantom, Sunburst, Renegade each get a
  distinct color) plus one shared "gold" accent for both cache stations, used for
  `Chip`/`Card` accents on the collection/compare views, not full theme repaints. Exact
  palette is a small, low-stakes implementation choice — no need to nail it down here.
- Key MUI components: `AppBar`, `BottomNavigation`, `Card` (word/treasure/story reveal),
  `Dialog` (reveal flow), `Avatar` (family avatar), `LinearProgress` (story completion),
  `Table`/`DataGrid`-lite (admin + compare), `Snackbar` (toasts, e.g. "word saved").

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
    map/page.tsx                  # static placeholder image + positioned icons, no map library
    compare/page.tsx
    finish/page.tsx                # finish QR lands here — seals the story, sets finishedAt
    admin/
      page.tsx                    # passcode gate
      AdminDashboard.tsx           # clock controls, live family table, manual correction
      AdminQrCodes.tsx             # qrcode.react grid for start + 7 station URLs + finish
    layout.tsx                    # MUI ThemeProvider, CssBaseline, BottomNavigation
  data/
    stations.ts                   # 7 stations: id, name, isBonus, optional blankType+horseName, x/y % or area radius
    adlib.ts                      # story template, 5 horse word pools + defaults, 2 gold-cache item pools
    avatars.ts                    # generic avatar set
  lib/
    firebase.ts                   # Firebase app/RTDB/Auth init
    hooks/
      useAuthUid.ts
      useRaceClock.ts
      useFamily.ts
      useAllFamilies.ts
  theme.ts                        # MUI theme + per-horse/gold-cache accent colors
database.rules.json                 # optional, for version-controlling the open RTDB rules
```

## Resolved (in favor of the fastest option, given the timeline)
- **Map**: static placeholder image with positioned icons, no map library, no GPS. A
  dynamic Leaflet + OpenStreetMap + live-geolocation version was designed earlier in
  iteration 2, then dropped after review flagged location-permission timing and
  screen-vs-outdoors concerns — reverting to the simpler approach.
- **Reveal animation**: plain CSS/MUI transitions only. No animation library.
- **QR codes**: rendered in-app via `qrcode.react` (admin view), not a manual external
  tool — see Admin QR Codes above (supersedes iteration 1's "generate by hand" plan).
- **Finish**: a dedicated QR-gated route, not a self-directed "read it whenever" screen
  — gives the big reveal moment an unambiguous trigger.
- **Bonus stations**: repurposed as gold caches, entirely disconnected from the story —
  simpler than making every station feed the ad-lib, and lets the "surprise, it's an
  ad-lib!" twist land cleanly since nothing in-course hints at it.
- **Hobby-horse count**: fixed at one per person, unconditionally — not derived from
  the app's data at all, so there's no logic to build for it beyond handing them out.
