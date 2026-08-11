# Rush Off 5k — Build Checklist (Iteration 2)

Ordered by dependency. Cross-reference `requirements.md`, `architecture.md`,
`adlib-words.md`. **All app code (sections 0-7) is implemented and verified
end-to-end** against the real Firebase backend. What remains is genuinely physical/
deployment work — sections 8-9 — not code.

## 0. Delete / Replace (iteration-1 leftovers that no longer match the docs)
- [x] `src/data/pokemon.ts` — delete (replaced by `src/data/adlib.ts`)
- [x] `src/data/finishItems.ts` — delete (fixed 1-hobby-horse-per-person needs no data)
- [x] `public/pokemon/*.png` — delete (58 Pokemon sprites, no longer used)
- [x] `src/app/station/[stationId]/StationCatch.tsx` — rewrite (Pokemon-catch UI →
      horse-word / gold-cache reveal UI, per station)
- [x] `src/app/collection/page.tsx` — rewrite (Pokemon grid → found-so-far list, no
      story/blank language per the twist-secrecy requirement)
- [x] `src/app/map/page.tsx` — rewrite (placeholder gradient → real `course-map.png`)
- [x] `src/app/compare/page.tsx` — light rewrite (Pokemon column headers → horse names
      + gold caches)
- [x] `src/app/admin/AdminDashboard.tsx` — extend (Pokemon table → words/caches table;
      add manual finish-trigger; add QR code rendering)

## 1. Foundation (mostly reusable as-is)
- [x] Next.js + MUI scaffold, static export config — reusable unchanged
- [x] `src/lib/firebase.ts` (lazy `getDb()`/`getAuthInstance()`) — reusable unchanged
- [x] Firebase console: Realtime Database + Anonymous Auth confirmed working — verified
      via a live end-to-end Playwright run against the real `rushoff2026` database
      (start → finds → finish → admin), not just a manual console check
- [x] `.env.local`: `NEXT_PUBLIC_FIREBASE_DATABASE_URL` confirmed working (same e2e run)
- [ ] `.env.local`: `NEXT_PUBLIC_ADMIN_PASSCODE` is still `till` — confirm that's really
      what you want live on race day, or change it before deploying
- [x] Add `qrcode.react` dependency (`pnpm add qrcode.react`) — new, needed for admin
      QR rendering

## 2. Theming & Art Direction (new work, do early — affects every page's look)
Per `architecture.md`'s expanded Theming & Art Direction section:
- [x] Pick and wire up a Western display font via `next/font/google` (e.g. "Rye" or
      "Sancreek") for headings/reveal moments only — confirm build-time network access
      to Google Fonts works in this environment before committing to it
- [x] `src/theme.ts` — add the per-horse/gold-cache color palette as theme tokens (not
      hardcoded hex), replacing iteration 1's per-Pokemon-type colors
- [x] Build one shared reveal-card component (e.g. `<WantedPosterCard>`) — parchment
      background, rope border, display-font headline — used by station reveals, gold
      cache reveals, and the finish story reveal, so all three feel like one system
      per the "highest-emotion moments" guidance
- [x] Swap default icons for themed equivalents at bottom-nav + key reveal moments only
      (lasso/horseshoe) — everything else stays default MUI icons (nice-to-have tier
      is explicitly deferred per architecture.md's scope tiers)

## 3. Static Data (rewrite)
- [x] `src/data/adlib.ts` — new file: story template, 5 horse word pools + defaults, 2
      gold-cache item pools, transcribed from `docs/adlib-words.md`
- [x] `src/data/stations.ts` — rewrite done: 7 stations are `adjective`/`pluralnoun`/
      `verb`/`sound`/`number` (horse-named) + `gold1`/`gold2`. **Map x/y coordinates
      are placeholder estimates only** — see Map Placement below, still open.
- [x] `src/data/avatars.ts` — unchanged, reusable as-is

### Map placement — still open
`course-map.png` is in `public/` and `/map` now renders it as the background with
icons positioned from `stations.ts`. But those coordinates are a rough guess made by
looking at the image (spread along the visible route), **not real decided placement**.
Once you decide where each of the 5 horse stations and 2 gold caches physically go,
update the `map: { x, y }` percentages in `src/data/stations.ts` to match.

## 4. Identity & Core Hooks (all reusable unchanged)
- [x] `useAuthUid()`, `useFamily()`, `useRaceClock()`, `useAllFamilies()` — no changes
      needed; the redesign only affects what's stored under `catches/{stationId}`
      (`foundId` instead of `pokemonId`), not the hooks themselves

## 5. Core Loop (rewrite — build and test end-to-end before anything else)
- [x] `/start` — mostly reusable; confirm copy doesn't leak story/theme language
      prematurely
- [x] `/station/[stationId]` — rewrite `StationCatch.tsx`:
  - Look up station config; branch on whether it's a horse station or gold-cache
    station for reveal copy ("you found [Horse]'s secret command word: '[word]'!" vs.
    "you found a hidden gold cache: [item]!")
  - Idempotency unchanged (existing find → show it, don't re-roll)
  - Never mention "story" or "blank" anywhere in this UI — twist secrecy is a hard
    requirement
- [x] `/finish` — **entirely new route**:
  - Redirect to `/start?returnTo=/finish` if no family yet (same pattern as stations)
  - First visit: set `finishedAt`, build the story from the family's 5 horse-station
    catches (falling back to each blank's fixed default for anything missed), render
    the full reveal ending in the universal catchphrase
  - Re-visit: idempotent, just re-show the same reveal (don't re-roll or re-set
    `finishedAt`)
  - This is the single highest-polish screen in the app per the art-direction
    guidance — budget real time here, not just wiring
- [x] **End-to-end test**: verified via Playwright against the live database — start →
      station find (idempotent on re-scan) → gold cache find → finish reveal (correct
      defaults for unfound blanks) → admin. **Still worth a real-phone pass** (Safari
      iOS + Android Chrome specifically) before race day — automated browser testing
      isn't a substitute for the actual camera-QR-scan hardware path.

## 6. Supporting Family-Facing Views (rewrite)
- [x] `/` — minor copy updates only (references to "catches" → "words/caches" if
      user-facing text says so)
- [x] `/collection` — found-so-far list, framed like the stations (no story language)
- [x] `/map` — swap placeholder for `course-map.png` as the background image; position
      icons using the real x/y percentages decided in step 3
- [x] `/compare` — update columns/labels for horse names + gold caches instead of
      Pokemon types

## 7. Admin (extend)
- [x] `/admin` — passcode gate unchanged
- [x] Clock start/stop/reset — unchanged
- [x] Live family table — update columns for words/caches found
- [x] Manual add/correct-a-catch — update for `foundId` field, still per-station
- [x] **New**: manual finish-trigger — a button per family that sets `finishedAt`
      directly, for when the physical finish QR is broken/missed
- [x] **New**: QR code grid — `qrcode.react` rendering for `/start`, all 7 stations,
      and `/finish` (9 total), each pointing at the real deployed URL

## 8. Deploy — still open
- [x] `next build` (static export) — confirmed working locally (`out/` generates clean,
      all 9 routes pre-render)
- [ ] `firebase deploy --only hosting` — not yet run; app has only been verified via
      local dev server, not the actual deployed URL
- [ ] `firebase deploy --only database` (open rules) — `database.rules.json` is written
      but not yet deployed; the live DB was reachable directly via its REST API during
      testing (rules already effectively open), but formally deploying the rules file
      hasn't been done

## 9. Physical Prep (parallel track, not blocked on the app) — still open
- [ ] Decide exact physical placement for all 5 horse stations + 2 gold caches along
      the real course, and update `stations.ts` map percentages accordingly (currently
      placeholder guesses — see Map Placement above)
- [ ] Decide exact finish QR placement — must not interfere with the real race
      finish-line flow/congestion
- [ ] Generate the 9 QR codes from the admin view once deployed; print/laminate
- [ ] Source 1 hobby-horse per expected participant (headcount, not per-family)
- [ ] Walk the course, verify cell signal at every station + finish location
- [ ] Full dry run on **real phone hardware** (one iPhone + one Android) — the
      automated e2e pass used a desktop headless browser, which doesn't exercise the
      actual camera/QR-scanner path
- [ ] Brief whoever's staffing the finish on handing out hobby-horses (now trivial —
      one per person, no counting)

## Still Open (from `requirements.md` Risks & Open Decisions)
- Whether kids get a physical artifact of their own (sticker/card) on top of the
  yell-the-catchphrase moment
- Physical fallback if a clue/finish QR card is lost/destroyed outright (the *digital*
  side is now fully covered by admin manual-correction + manual finish-trigger; the
  *physical* backup-card question is still undecided)
