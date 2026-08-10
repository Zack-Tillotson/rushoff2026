# Rush Off 5k — Build Checklist

Ordered by dependency, not by priority — each phase assumes the previous one works.
Cross-reference `requirements.md`, `architecture.md`, and `pokemon-roster.md`.

## 1. Foundation
- [x] `create-next-app` (App Router), add MUI (`@mui/material`, `@mui/icons-material`,
      `@emotion/react`, `@emotion/styled`)
- [ ] Firebase project: enable Realtime Database + Anonymous Auth in the console
      (rules/config files are written — **still need to confirm these are actually
      turned on in the Firebase console**)
- [x] Set fully open RTDB rules (`.read: true`, `.write: true`) per `architecture.md`
      (`database.rules.json` — not yet deployed, see Deploy)
- [x] `src/lib/firebase.ts` — lazy-init `getDb()`/`getAuthInstance()`; `NEXT_PUBLIC_*`
      env vars for Firebase config
- [x] `src/theme.ts` — MUI theme + per-type accent colors
- [x] `src/app/layout.tsx` — `ThemeProvider`, `CssBaseline`, `BottomNavigation` shell

## 2. Static Data
- [x] `src/data/stations.ts` — 7 stations (id, type, name, isBonus, map coords/area —
      **coords are placeholders, TODO once the real course map exists**)
- [x] `src/data/pokemon.ts` — transcribed roster, sprites copied from the local
      `sprites` repo into `/public/pokemon/{dexNumber}.png`
- [x] `src/data/avatars.ts` — the 8 generic emoji/icon avatars

## 3. Identity & Core Hooks
- [x] `useAuthUid()` — `signInAnonymously()` + current uid
- [x] `useFamily()` — live `/families/{uid}` via `onValue`
- [x] `useRaceClock()` — live `/race/clock` + local tick for elapsed display
- [x] `useAllFamilies()` — live `/families` list

## 4. Core Loop (build and test this end-to-end before anything else)
- [x] `/start` — name + avatar picker, creates `/families/{uid}`, redirect handling
      (`?returnTo=`)
- [x] `/station/[stationId]` — `generateStaticParams` for the 7 ids, redirect-to-`/start`
      if no family yet, idempotent catch check, random pick + write, reveal UI
- [ ] **Manual test**: start → scan a station → see a catch appear, on a real phone —
      **blocked on `NEXT_PUBLIC_FIREBASE_DATABASE_URL` (see below)**

## 5. Supporting Family-Facing Views
- [x] `/` — home: race clock (read-only), your family's status, nav
- [x] `/collection` — your catches by type, completion indicator, "proof" view for the
      finish line
- [x] `/map` — placeholder course background, pins for 5 main stations, area circles
      for 2 bonus (swap in the real course image + coords when ready)
- [x] `/compare` — shared table of all families' catches

## 6. Admin
- [x] `/admin` — client-side passcode gate (`NEXT_PUBLIC_ADMIN_PASSCODE`, currently a
      placeholder — change it before race day)
- [x] Clock start/stop/reset controls (writes `/race/clock`)
- [x] Live table of every family + catch (`useAllFamilies`)
- [x] Manual add/correct-a-catch form (writes `/families/{id}/catches/{stationId}`,
      `manual: true`)

## 7. Deploy
- [x] `next.config` → `output: 'export'`
- [x] `firebase.json` + `.firebaserc` (project `rushoff2026`) → `out/` as public dir
- [ ] `firebase deploy --only hosting`
- [ ] `firebase deploy --only database`

**Blocking gap**: `firebase-config.md` didn't include the Realtime Database URL (it's a
separate value from the general web-app config snippet). `.env.local` has every other
`NEXT_PUBLIC_FIREBASE_*` value filled in from it, but
`NEXT_PUBLIC_FIREBASE_DATABASE_URL` is empty. Grab it from Firebase console → Realtime
Database → your instance (looks like
`https://rushoff2026-default-rtdb.<region>.firebasedatabase.app`) before any real
read/write testing can happen. Also update `NEXT_PUBLIC_ADMIN_PASSCODE` from its
placeholder.

## 8. Physical Prep (parallel track, not blocked on the app — start early)
- [ ] Generate the 8 QR codes (start + 7 stations) once the deployed URL is live
- [ ] Print/laminate clue cards, plan how to stake/secure against wind
- [ ] Source/assign the 7 themed finish-line carry items
- [ ] Walk the course, verify cell signal at each planned station location
- [ ] Full dry run (start → catch at each station → finish) on one iPhone + one Android
- [ ] Brief finish-line volunteer on matching caught types to carry items

## Still Open (from `requirements.md` Risks & Open Decisions — resolve before Friday)
- Finish-line staffing plan for matching items without a backup
- Whether kids get a physical artifact of their own (sticker/card)
- Physical fallback if a clue card is lost/destroyed outright
