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
    catches:
      /{stationId}
        pokemonId: string
        caughtAt: <server timestamp>
        manual: boolean   # true if added via admin manual-correction
```

Everything else — the list of stations (id, type, name, isBonus, map coordinates/area),
the ~10-Pokemon pool per type, and the generic avatar set — is **static config shipped
with the app** (TypeScript/JSON under `src/data/`), not stored in the database. It never
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

## Pokemon Data Source
The `sprites` and `pokemon.json` repos already cloned locally under `~/Documents/programming`
are a ready-made offline source for names/sprite images/types — no need to hit a live API
(PokeAPI) at runtime or build time. Pull the ~70 Pokemon needed (10 per type × 7 types)
from those into `src/data/pokemon.ts` once, bundled as static assets.

## Pages / Routes (App Router)

| Route | Purpose |
|---|---|
| `/` | Home: shared race clock (read-only), status of your own family, nav into the rest |
| `/start` | Start QR lands here. Signs in anonymously if not already, then checks `/families/{uid}`: if it exists, redirect straight to `/`; if not, show the name+avatar form and create the record at that uid. |
| `/station/[stationId]` | Clue QR lands here. `stationId` is one of the 7 known ids, pre-rendered via `generateStaticParams` (required for the static export). If `/families/{uid}` doesn't exist yet, redirect to `/start?returnTo=/station/[id]`. If this station is already caught by this family, show the existing catch (idempotent — re-scanning never re-rolls). Otherwise: random pick from the station's type pool, write to DB, play the reveal animation. |
| `/collection` | This family's own caught Pokemon, by type, with a completion indicator. Doubles as the "proof" screen to show a finish-line volunteer which themed items to hand over. |
| `/map` | Map with pins for the 5 main stations and fuzzy area circles for the 2 bonus stations. |
| `/compare` | Shared view of all families and what they've caught — full-set completion, bonus catches, cross-family duplicates. |
| `/admin` | Organizer-only. Passcode-gated (see Security). Clock start/stop/reset, live table of every family + catch, manual add/correct-a-catch. |

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
- Per-type accent colors (Fire=red/orange, Water=blue, Electric=yellow, Grass=green,
  Bug=lime/yellow-green, Dragon=purple, Ghost=indigo) used for `Chip`/`Card` accents on
  collection and compare views, not full theme repaints.
- Key MUI components: `AppBar`, `BottomNavigation`, `Card`/`CardMedia` (Pokemon reveal),
  `Dialog` (catch reveal flow), `Avatar` (family avatar), `LinearProgress` (set
  completion), `Table`/`DataGrid`-lite (admin + compare), `Snackbar` (toasts, e.g. "catch
  saved").

## QR Code Generation
Not part of the codebase. Once the app is deployed, generate the 7 needed QR codes
(`/start`, `/station/fire`, `/station/water`, … `/station/ghost`) by hand using any free
online QR generator, and print/laminate them directly. A one-time, 5-minute manual task
doesn't need a script.

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
    map/page.tsx
    compare/page.tsx
    admin/page.tsx
    layout.tsx                    # MUI ThemeProvider, CssBaseline, BottomNavigation
  data/
    stations.ts                   # 7 stations: id, type, name, isBonus, coords/area
    pokemon.ts                    # ~10 Pokemon per type, sourced from local sprites/pokemon.json repos
    avatars.ts                    # generic avatar set
  lib/
    firebase.ts                   # Firebase app/RTDB/Auth init
    hooks/
      useAuthUid.ts
      useRaceClock.ts
      useFamily.ts
      useAllFamilies.ts
  theme.ts                        # MUI theme + per-type accent colors
database.rules.json                 # optional, for version-controlling the open RTDB rules
```

## Resolved (in favor of the fastest option, given the Friday deadline)
- **Map**: a static image of the course with absolutely-positioned pins (main stations)
  and circles (bonus-station areas). No map library, no interactivity needed for one
  known, fixed course.
- **Reveal animation**: plain CSS/MUI transitions only. No animation library.
