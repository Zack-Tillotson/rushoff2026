# Rush Off 5k — Build Checklist (Iteration 3)

Ordered by dependency. Cross-reference `requirements.md`, `architecture.md`,
`clue-copy.md`. **All app code is implemented and verified end-to-end** against the
real Firebase backend. What remains is genuinely physical/deployment work, not code.

## 0. Simplification from Iteration 2 (done)
- [x] Delete `src/data/adlib.ts` entirely — no more words/items/story template
- [x] `src/data/stations.ts` — station ids are now plain `'1'`–`'7'` (main 1–5, secret
      6–7), `kind: 'main' | 'secret'`, no horse names
- [x] `src/lib/types.ts` — `Catch` simplified to `{ caughtAt, manual? }`, no `foundId`
- [x] `src/theme.ts` — two clue-kind accent colors (`CLUE_COLORS.main`/`.secret`)
      replacing the per-horse palette
- [x] `StationCatch.tsx` — simple "Found It!" confirmation, no random reveal;
      distinguishes first-find celebratory copy from already-found re-visit copy
- [x] `/finish` — welcome-to-the-gang celebration with main/secret found counts, no
      story assembly
- [x] `collection`/`map`/`compare`/`admin` — all updated for the simplified model
- [x] Home page — hides the race clock until the organizer starts it, then shows live
      elapsed time (per this iteration's specific ask)
- [x] `/map` — simplified further: shows `course-map.png` as-is with no pins/overlays;
      tap-to-open-fullsize for native pinch-zoom. Removed the now-unused `map: {x,y}`
      field from `stations.ts` entirely (dead code once pins were dropped).
- [x] Fixed ambiguous "Secret"/"Secret" column headers in admin + compare tables (now
      "Secret #6"/"Secret #7")

## 1. Foundation (unchanged from iteration 2, still valid)
- [x] Next.js + MUI scaffold, static export config
- [x] `src/lib/firebase.ts` (lazy `getDb()`/`getAuthInstance()`)
- [x] Firebase Realtime Database + Anonymous Auth confirmed working (live e2e run)
- [x] `.env.local`: `NEXT_PUBLIC_FIREBASE_DATABASE_URL` confirmed working
- [ ] `.env.local`: `NEXT_PUBLIC_ADMIN_PASSCODE` is still `till` — confirm that's really
      what you want live on race day, or change it before deploying
- [x] `qrcode.react` dependency installed

## 2. End-to-end verification (done)
Verified via Playwright against the live `rushoff2026` database: home (pre-race
message → live clock once started) → start → main clue find (idempotent on re-scan,
correct celebratory-vs-already-found copy) → secret clue find → collection counts →
finish welcome (correct main/secret counts, no story/twist language anywhere) → admin
(live table, manual find/unfind toggle, manual finish trigger, 9 QR codes). Production
test data cleared from the DB after each verification pass.

**Still worth a real-phone pass** (Safari iOS + Android Chrome specifically) before
race day — automated browser testing doesn't exercise the actual camera/QR-scanner
hardware path.

## 3. Deploy — still open
- [x] `next build` (static export) — confirmed working locally (`out/` generates clean,
      all 9 routes pre-render, including the renumbered `/station/1`–`/station/7`)
- [ ] `firebase deploy --only hosting` — not yet run; app has only been verified via
      local dev server, not the actual deployed URL
- [ ] `firebase deploy --only database` (open rules) — `database.rules.json` is written
      but not yet formally deployed (the live DB is reachable directly via REST during
      testing since rules are already effectively open, but the file itself hasn't
      been pushed via the CLI)

## 4. Physical Prep — still open
- [ ] Decide exact physical placement for all 5 main clues + 2 secret clues along the
      real course (the map no longer needs coordinates — it's a plain reference image
      now, so this is purely a physical decision, nothing to update in code)
- [ ] Decide exact finish QR placement — must not interfere with the real race
      finish-line flow/congestion
- [ ] Generate the 9 QR codes from the admin view once deployed; print/laminate
- [ ] Source 1 hobby-horse per expected participant (headcount, not per-family, not
      scaled by clues found)
- [ ] Walk the course, verify cell signal at every clue + finish location
- [ ] Full dry run on real phone hardware (one iPhone + one Android)
- [ ] Organizer prepares the short in-person tryout explanation for the start line —
      the app doesn't narrate the premise, so it needs to be said out loud
- [ ] Brief whoever's staffing the finish on handing out hobby-horses (trivial — one
      per person, no counting)

## Still Open (from `requirements.md` Risks & Open Decisions)
- Whether kids get a physical artifact of their own (sticker/card) on top of the
  finish-line welcome moment
- Physical fallback if a clue/finish QR card is lost/destroyed outright (the *digital*
  side is fully covered by admin's manual find-toggle + manual finish-trigger; the
  *physical* backup-card question is still undecided)
