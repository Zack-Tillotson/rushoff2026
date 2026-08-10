# Rush Off 5k — Build Checklist (Iteration 2)

Ordered by dependency. Cross-reference `requirements.md`, `architecture.md`,
`adlib-words.md`. **The existing `src/` code is entirely iteration-1 shaped** (Pokemon
catches, no finish route, no themed art direction) — this checklist calls out exactly
what carries over unchanged, what needs a rewrite, and what's brand new, so nothing
gets missed in the gap between the docs (caught up to iteration 2) and the code
(still iteration 1).

## 0. Delete / Replace (iteration-1 leftovers that no longer match the docs)
- [ ] `src/data/pokemon.ts` — delete (replaced by `src/data/adlib.ts`)
- [ ] `src/data/finishItems.ts` — delete (fixed 1-hobby-horse-per-person needs no data)
- [ ] `public/pokemon/*.png` — delete (58 Pokemon sprites, no longer used)
- [ ] `src/app/station/[stationId]/StationCatch.tsx` — rewrite (Pokemon-catch UI →
      horse-word / gold-cache reveal UI, per station)
- [ ] `src/app/collection/page.tsx` — rewrite (Pokemon grid → found-so-far list, no
      story/blank language per the twist-secrecy requirement)
- [ ] `src/app/map/page.tsx` — rewrite (placeholder gradient → real `course-map.png`)
- [ ] `src/app/compare/page.tsx` — light rewrite (Pokemon column headers → horse names
      + gold caches)
- [ ] `src/app/admin/AdminDashboard.tsx` — extend (Pokemon table → words/caches table;
      add manual finish-trigger; add QR code rendering)

## 1. Foundation (mostly reusable as-is)
- [x] Next.js + MUI scaffold, static export config — reusable unchanged
- [x] `src/lib/firebase.ts` (lazy `getDb()`/`getAuthInstance()`) — reusable unchanged
- [ ] Firebase console: confirm Realtime Database + Anonymous Auth are actually enabled
      (previously flagged as unconfirmed — verify before anything else)
- [ ] `.env.local`: confirm `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is filled in for real
      (was a blocking gap at the end of iteration 1 — re-verify it's still set)
- [ ] `.env.local`: set a real `NEXT_PUBLIC_ADMIN_PASSCODE` (currently `till`, per
      earlier decision — confirm that's still what you want for race day)
- [ ] Add `qrcode.react` dependency (`pnpm add qrcode.react`) — new, needed for admin
      QR rendering

## 2. Theming & Art Direction (new work, do early — affects every page's look)
Per `architecture.md`'s expanded Theming & Art Direction section:
- [ ] Pick and wire up a Western display font via `next/font/google` (e.g. "Rye" or
      "Sancreek") for headings/reveal moments only — confirm build-time network access
      to Google Fonts works in this environment before committing to it
- [ ] `src/theme.ts` — add the per-horse/gold-cache color palette as theme tokens (not
      hardcoded hex), replacing iteration 1's per-Pokemon-type colors
- [ ] Build one shared reveal-card component (e.g. `<WantedPosterCard>`) — parchment
      background, rope border, display-font headline — used by station reveals, gold
      cache reveals, and the finish story reveal, so all three feel like one system
      per the "highest-emotion moments" guidance
- [ ] Swap default icons for themed equivalents at bottom-nav + key reveal moments only
      (lasso/horseshoe) — everything else stays default MUI icons (nice-to-have tier
      is explicitly deferred per architecture.md's scope tiers)

## 3. Static Data (rewrite)
- [ ] `src/data/adlib.ts` — new file: story template, 5 horse word pools + defaults, 2
      gold-cache item pools, transcribed from `docs/adlib-words.md`
- [ ] `src/data/stations.ts` — rewrite: 7 stations become `adjective`/`pluralnoun`/
      `verb`/`sound`/`number` (horse-named, `blankType` + `horseName` fields) +
      `gold1`/`gold2` (no blank association). Map `x`/`y` percentages need real values
      now that `public/course-map.png` exists — see Map Placement below.
- [x] `src/data/avatars.ts` — unchanged, reusable as-is

### Map placement (new, needed before `stations.ts` coordinates are final)
`course-map.png` is now in `public/`. It shows the real course: start near the west
side (Broadlands neighborhood/pond), finish near the east side (West 136th Ave /
North Raritan Way), route curving north around Legacy High School and through Quail
Creek Park. **Decide where each of the 5 horse stations physically goes along this
route**, then convert each to an x/y percentage of the image (1472×705px) for
`stations.ts`. The 2 gold-cache stations just need a general area, not an exact point.
This is a you-decide-the-physical-placement task, not something to guess in code.

## 4. Identity & Core Hooks (all reusable unchanged)
- [x] `useAuthUid()`, `useFamily()`, `useRaceClock()`, `useAllFamilies()` — no changes
      needed; the redesign only affects what's stored under `catches/{stationId}`
      (`foundId` instead of `pokemonId`), not the hooks themselves

## 5. Core Loop (rewrite — build and test end-to-end before anything else)
- [ ] `/start` — mostly reusable; confirm copy doesn't leak story/theme language
      prematurely
- [ ] `/station/[stationId]` — rewrite `StationCatch.tsx`:
  - Look up station config; branch on whether it's a horse station or gold-cache
    station for reveal copy ("you found [Horse]'s secret command word: '[word]'!" vs.
    "you found a hidden gold cache: [item]!")
  - Idempotency unchanged (existing find → show it, don't re-roll)
  - Never mention "story" or "blank" anywhere in this UI — twist secrecy is a hard
    requirement
- [ ] `/finish` — **entirely new route**:
  - Redirect to `/start?returnTo=/finish` if no family yet (same pattern as stations)
  - First visit: set `finishedAt`, build the story from the family's 5 horse-station
    catches (falling back to each blank's fixed default for anything missed), render
    the full reveal ending in the universal catchphrase
  - Re-visit: idempotent, just re-show the same reveal (don't re-roll or re-set
    `finishedAt`)
  - This is the single highest-polish screen in the app per the art-direction
    guidance — budget real time here, not just wiring
- [ ] **Manual test**: start → find all 5 horse words + both gold caches → finish →
      confirm the reveal shows the right story, on a real phone

## 6. Supporting Family-Facing Views (rewrite)
- [ ] `/` — minor copy updates only (references to "catches" → "words/caches" if
      user-facing text says so)
- [ ] `/collection` — found-so-far list, framed like the stations (no story language)
- [ ] `/map` — swap placeholder for `course-map.png` as the background image; position
      icons using the real x/y percentages decided in step 3
- [ ] `/compare` — update columns/labels for horse names + gold caches instead of
      Pokemon types

## 7. Admin (extend)
- [ ] `/admin` — passcode gate unchanged
- [ ] Clock start/stop/reset — unchanged
- [ ] Live family table — update columns for words/caches found
- [ ] Manual add/correct-a-catch — update for `foundId` field, still per-station
- [ ] **New**: manual finish-trigger — a button per family that sets `finishedAt`
      directly, for when the physical finish QR is broken/missed
- [ ] **New**: QR code grid — `qrcode.react` rendering for `/start`, all 7 stations,
      and `/finish` (9 total), each pointing at the real deployed URL

## 8. Deploy (unchanged from iteration 1)
- [ ] `next build` (static export) → `firebase deploy --only hosting`
- [ ] `firebase deploy --only database` (open rules)

## 9. Physical Prep (parallel track, not blocked on the app)
- [ ] Decide exact physical placement for all 5 horse stations + 2 gold caches along
      the real course, and convert to map percentages (feeds back into step 3)
- [ ] Decide exact finish QR placement — must not interfere with the real race
      finish-line flow/congestion
- [ ] Generate the 9 QR codes from the admin view once deployed; print/laminate
- [ ] Source 1 hobby-horse per expected participant (headcount, not per-family)
- [ ] Walk the course, verify cell signal at every station + finish location
- [ ] Full dry run (start → all 5 horses → both gold caches → finish) on one iPhone +
      one Android device
- [ ] Brief whoever's staffing the finish on handing out hobby-horses (now trivial —
      one per person, no counting)

## Still Open (from `requirements.md` Risks & Open Decisions)
- Whether kids get a physical artifact of their own (sticker/card) on top of the
  yell-the-catchphrase moment
- Physical fallback if a clue/finish QR card is lost/destroyed outright (the *digital*
  side is now fully covered by admin manual-correction + manual finish-trigger; the
  *physical* backup-card question is still undecided)
