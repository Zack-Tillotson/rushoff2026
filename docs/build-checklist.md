# Rush Off 5k — Build Checklist (Iteration 3)

Ordered by dependency. Cross-reference `requirements.md`, `architecture.md`,
`clue-copy.md`. **The app is built, deployed, and live at
https://rushoff2026.web.app.** What remains is physical prep, not code/deploy work.

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

## 0b. Post-iteration-3 refinements (done)
- [x] Removed the `/admin` passcode gate entirely — unlisted URL only now. Deleted
      `NEXT_PUBLIC_ADMIN_PASSCODE` from `.env.local`.
- [x] Finish-time comparison: `src/lib/finishTime.ts` (`getFinishTimeMs`, guards
      against negative time from a stale finish predating a clock reset) + shared
      `src/lib/formatElapsed.ts`. `/finish` shows the family's own time; `/compare`
      added a sorted `Time` column — **`/compare` was subsequently removed
      entirely, see 0c below**, so this cross-family time comparison no longer
      exists anywhere. `getFinishTimeMs`/`formatElapsed` are kept, used only by
      `/finish` now.
- [x] Extra-secret clues (6/7) are now genuinely hidden until found — no "0/2
      extra-secret" mention or placeholder card on `/`, `/collection`, or `/finish`
      until a family has found at least one.
- [x] Admin mobile UX: QR grid → single column, family table → per-family cards
      with wrapped clue chips (no more horizontal scrolling on a phone).

## 0c. `/compare` removed entirely (done)
- [x] Deleted `src/app/compare/page.tsx` and the "Compare" tab from `BottomNav.tsx`
- [x] There is now **no family-facing cross-family comparison of any kind** — no
      shared clue-progress table, no cross-family finish-time sorting. Each family
      only ever sees its own progress (`/collection`) and its own finish time
      (`/finish`). The organizer can still see every family's progress, but only
      via `/admin`, not exposed to families.
- [x] Cleaned up now-stale references: `BottomNavigation` tabs (Home/Map/Collection
      only), `useAllFamilies()`'s remaining consumer is `/admin` only, docs updated

## 1. Foundation (unchanged from iteration 2, still valid)
- [x] Next.js + MUI scaffold, static export config
- [x] `src/lib/firebase.ts` (lazy `getDb()`/`getAuthInstance()`)
- [x] Firebase Realtime Database + Anonymous Auth confirmed working (live e2e run)
- [x] `.env.local`: `NEXT_PUBLIC_FIREBASE_DATABASE_URL` confirmed working
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

## 3. Deploy (done)
- [x] `next build` (static export) — `out/` generates clean, all routes pre-render
- [x] `firebase deploy --only hosting` — **live at https://rushoff2026.web.app**
- [x] Fixed a real deploy bug found during verification: every route except `/`
      404'd on the live site (Firebase Hosting needs `cleanUrls: true` to map
      `/start` → `start.html`; Next's static export doesn't emit `/start/index.html`
      the way Firebase's default routing expects). Added `cleanUrls: true` to
      `firebase.json`, redeployed, confirmed all 9 routes (`/`, `/start`,
      `/admin`, `/collection`, `/map`, `/finish`, `/station/1`–`/station/7`) return
      200, and `/compare` correctly still 404s.
- [x] Verified `identitytoolkit.googleapis.com` (Firebase Auth) is reachable from
      the live origin via `curl` (200) — a full Playwright browser check against
      the live URL specifically couldn't run in this dev sandbox (its DNS resolves
      Google API domains into CGNAT space, which Chromium's Private Network Access
      blocks from a "public" origin like the deployed site — this didn't affect any
      of the `localhost` testing all session, which is why it wasn't caught until
      now). Not a production bug; **worth one manual live check on a real phone**
      before race day to be certain, same as the existing real-phone-pass item below.
- [ ] `firebase deploy --only database` — `database.rules.json` (open rules) not yet
      formally pushed via the CLI. The live DB is already reachable/writable via
      REST (rules are already effectively open from console configuration), so
      this is just about keeping the rules file in sync, not a functional gap.

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
