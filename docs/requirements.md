# Rush Off 5k — Companion Site Requirements

## Background
The Rush Off 5k is an annual family fun run (mostly kids + siblings' families), themed
around its own premise: horse thieves who jump on a horse and rush off. This site drives
an in-course activity leaning into that — a QR-code hunt where each station is a named
wild horse whose **secret command word** your family learns. Unbeknownst to families
during the hunt, those words are secretly building a Mad-Libs-style outlaw story — a
twist only revealed at the finish line, ending in a catchphrase everyone yells together
to "start" their hobby-horse gallop. Two additional hidden stations are a separate,
unrelated side-collectible: **hidden gold caches**, just for bragging rights.

## Timeline
Race day is **Saturday, August 15** — about 5 days out from this doc. The full feature
set below (including both bonus stations) is the current MVP target for race day; see
**Risks & Open Decisions** for the scope-cut option if time runs short.

## Key Constraint
Parents/adults carry phones; kids generally do not. Any interaction that requires a phone
(scanning a QR code, viewing a collection) is mediated by a parent on behalf of their kid(s).
Kids do the physical finding; parents do the scanning/tapping.

## Core Concept
1. At the start line, each family scans a **start QR code** to begin their session/tracking
   on the site (reuses the same scan mechanic they'll use at every station, so it's a
   flow that's already been tested by the time it matters).
2. Paper clues (each with its own QR code) are hidden along the race course.
3. Kids/families physically find a clue; a parent scans the QR code with their phone.
4. At a main station, scanning reveals "you found [Horse]'s secret command word:
   '[word]'!" — framed entirely as horse-taming, never mentioning a story or a blank.
   At a hidden station, scanning reveals a gold-cache find instead — a wholly separate,
   unrelated bragging-rights collectible.
5. Families have no idea, during the hunt, that the command words are secretly filling
   in a Mad-Libs story — that's the twist, held back until the finish.
6. At the finish line, a family scans a **finish QR code** that reveals the twist: their
   complete story (any missed words fall back to a fixed default, so it never looks
   broken), ending in a catchphrase everyone shouts together as the "command" to gallop
   the final stretch. Every participant gets exactly one hobby-horse, always — this
   isn't scaled by how much was found.
7. Throughout, the organizer can monitor and control the event live via an **admin
   view**, which also renders every route's QR code (start, all 7 stations, and finish)
   for testing on the organizer's own phone.

## Technical Architecture
- **Hosting**: Firebase Hosting serves the web app. Mobile web only — no app install;
  clue/start QR codes link directly to pages opened via each phone's native camera/QR
  scanner. Must work on mainstream iOS Safari and Android Chrome.
- **Data store**: Firebase **Realtime Database** as the single shared/central store for:
  - the race clock's state (start timestamp, running/stopped/reset),
  - family records (name, avatar, and the word learned at each station),
  - so every family's phone and the admin view stay live-synced with the same shared
    state, with no page refresh needed (this is what makes a *shared* race clock and
    live admin monitoring possible).
- **Map**: back to a static course-image placeholder (no live map/GPS) — you'll supply
  the real map image directly; the dynamic Leaflet/GPS approach from earlier in
  iteration 2 is dropped entirely (simpler, and removes the location-permission and
  screen-staring concerns raised in review).
- **Admin QR testing**: the admin view renders actual scannable QR codes for the start
  URL, all 7 station URLs, and the finish URL, generated client-side — so the organizer
  can test (or let someone else scan) every step from their own phone without needing
  the printed physical clues on hand.
- **Session identity**: a family's data lives server-side in the Realtime Database,
  keyed by that device's Firebase Anonymous Auth id, which Firebase itself persists in
  the browser — so closing the tab or restarting the phone doesn't lose anything, as
  long as it's the same device/browser. A genuinely different device/browser (or
  cleared browser data) has no way to reconnect to an existing family's data and would
  start a new, blank one — accepted as a limitation given the event is same-day,
  same-device in practice, not a cross-device account system.
- **QR reuse**: each station's physical QR code is shared by all families — it is **not**
  a single-use token. Every family that scans it independently gets their own catch
  recorded against their own family record. Multiple families can (and will) scan the
  same physical code over the course of the event.
- **Word/treasure randomization**: a family's pick at a station is an independent random
  draw from that station's pool (~10 for the 5 horse stations, ~4 for the 2 gold-cache
  stations), with replacement *across* families — so two different families can end up
  with the same word or treasure from the same station. This is expected, and is part
  of what makes the comparison view interesting.
- **Scale**: ~5 family groups + 3 older kids is a handful of records and a low write
  volume — Realtime Database comfortably covers this; no additional backend needed.

## Decided Features

### Start flow / team identification
- Scanning the shared **start QR code** (posted at the start line) begins a family's
  session and starts tracking their catches — no manual team name typing required to
  *start*, but immediately after scanning, the family enters a **name** and picks a
  **picture/avatar** to represent them for the rest of the site (collection view, map,
  comparison view). This creates their record in the Realtime Database.
- Avatar picture set: for v1, a handful of **generic/default avatars** only (generated
  as part of this build). Custom per-family avatars are a follow-up, added later once
  supplied.

### Clue stations: 5 horses + 2 hidden gold caches
- **5 main stations**, each a named wild horse (Sundance, Comet, Phantom, Sunburst,
  Renegade — see `docs/adlib-words.md`) whose secret command word you learn. In-course
  framing is entirely "you tamed this horse's word" — no mention of a story. Each word
  secretly maps to one blank (`ADJECTIVE`, `PLURAL_NOUN`, `VERB`, `SOUND`, `NUMBER`) in
  a fixed Mad-Libs template, revealed only at the finish.
- **2 hidden/bonus stations** are **gold caches** — a completely separate collectible
  with no connection to the horses or the story. Purely bragging rights via the
  comparison view. Optional/off-path finds, not required for anything.
- Each horse station has a pool of ~10 possible words; each gold cache has a pool of ~4
  (bigger/sillier treasure items). Scanning shows a reveal screen with some reveal UX
  before showing what was specifically found.
- All words/treasure names are original — no licensed IP involved, so no restrictions
  on sharing the site publicly if that ever comes up.
- **Missing words default to a fixed value per blank** (not random, not a raw
  placeholder — see `docs/adlib-words.md` for the exact defaults) so a partial story
  never looks broken. Given the expectation that most/all families reach all 5 horse
  stations, this is a safety net, not the common case. Gold caches have no default —
  missing one just means missing it, nothing degrades.
- Comparison view after the race: given the small group, a simple shared view/table of
  who found what — full-story completion, rare gold-cache finds, cross-family
  duplicates — is enough; no need for a heavyweight leaderboard system.

### Map & wayfinding (hint mechanism)
- A **static course-image placeholder** for now — you'll supply the real map image
  directly (no dynamic map library, no GPS, no live location). Icons for the 5 main
  stations are positioned on the image; the 2 bonus stations show only a general
  **area** (not an exact icon) — this is the "hint": enough to guide a determined
  family without giving away the exact spot.
- This map view serves as the hint mechanism; no separate stuck-detection/timer-based hint
  trigger is needed on top of it.
- No GPS coordinates needed for stations — placement is just positioning icons on
  whatever image you supply, same lightweight approach as the original iteration-2 plan
  before the (now-dropped) real-map detour.

### Finish-line reveal & challenge
- A **finish QR code**, posted at the finish, is the trigger for the big moment: scanning
  it is the first time the family sees this was an ad-lib story all along — their words
  (or defaults, for anything missed) filled into the template, ending in the universal
  shouted catchphrase. This gives the twist reveal a clear, unambiguous trigger rather
  than families deciding for themselves when to read/yell it.
- Every participant gets **exactly one hobby-horse, unconditionally** — fixed, not
  scaled by how many horses or gold caches were found. This is simpler than a scaled
  design in every way: no counting, no matching, nobody's carry looks different from
  anyone else's. It also fully resolves the "finish-line staffing" risk flagged
  earlier — a volunteer just hands one out per person, full stop.
- Logistics: source enough hobby-horses for every expected participant (a headcount
  question, not something the app tracks), plus a physical finish QR code posted at the
  finish — placement needs to not interfere with the actual race's real finish-line
  flow/congestion (see Pre-Race Checklist).

### Race clock
- A single shared elapsed-time clock, backed by the Realtime Database, shown to everyone
  on the site — the same for all families, like a real race clock. Used purely for
  in-app tension, not as official race timing.
- Controlled via the admin view (start/stop/reset) — see below.

### Admin view
- A separate, organizer-only view of the site, not exposed to families as a normal part
  of the flow (simplest protection at this scale: an unlisted URL and/or a basic
  passcode — full user auth is not warranted for ~8 groups).
- Capabilities:
  - **Start / stop / reset** the shared race clock.
  - **Live view of all families/teams** and which horse words/gold caches each has
    found so far, updating in real time as families scan stations.
  - **Manually add/correct a catch** for a family — this is the fallback for a destroyed
    clue, a QR that won't scan, or a dispute, so a single physical/technical hiccup
    doesn't require rebuilding anything mid-event.
  - **Manually trigger a family's finish reveal** — the same idea, applied to the finish
    QR specifically: if it's destroyed, won't scan, or a family walks past it, the
    organizer can set that family as finished directly from the admin view, so the
    finish QR being a single point of failure no longer blocks the big reveal moment.
  - **QR codes for every route** (start + all 7 stations + finish), rendered directly in
    the admin view so the organizer can test the whole flow — or hand their phone to
    someone else to scan — without needing the printed physical clues on hand. Useful
    both before race day (dry runs) and during the event (fixing a station on the fly).
- This is the organizer's single control point during the event, carried on the
  organizer's own phone — it's what lets one person "mind the store" without being
  physically present at every station.

### Visual identity & polish
- The app should feel like *one* cohesive branded artifact — an Old West outlaw
  object you're interacting with — not a generic app with themed copy pasted in.
  This matters most at the reveal moments (station catches, gold-cache finds, and
  especially the finish-line story twist), since those are the emotional peaks of the
  whole experience and deserve the most visual polish.
- The real event logo (`public/horse-mascot-purple.png`) is the style reference (bold
  ink line-art, rope-circle badge, vintage rodeo-flyer energy), even though it's not
  wired into the app yet per the earlier decision. See `docs/architecture.md`'s Theming
  & Art Direction section for the concrete typography/color/motif decisions this drives.

## Target Users
- **Parents/adult siblings**: carry phones, do the scanning, view the map, collections,
  and race clock. Primary UI audience.
- **Kids**: no phones, interact entirely through the physical world (finding clues,
  the finish carry challenge) — the site itself is not directly used by them.
- **Organizer (you)**: uses the admin view to control the clock and monitor progress
  live during the event.

## Connectivity
- Cell signal along the course is expected to be reliable. No offline mode/caching is
  required for v1. Recommended: physically walk the course and check signal at each
  planned station location before finalizing placement (see Pre-Race Checklist).

## Out of Scope
- Photo upload/sharing site (dropped).
- GPS/location of any kind — dropped entirely along with the dynamic map. No live
  position, no race timing/results via GPS, no replacing any existing race-day tooling.
  The race clock here is just for in-app tension, not official timing.
- Stuck-detection or explicit "give me a hint" interaction — the map covers this.
- Typing a team name as the *trigger* to start (the start QR scan is the trigger; name
  entry happens right after, as onboarding, not as the identification mechanic itself).
- Full user authentication/accounts for admin access — an unlisted URL/passcode is
  sufficient at this scale.
- Offline support / local caching of catches.
- Any protection against data tampering — the shared database is open for read/write to
  anyone using the app for the week of the event (no per-family write locks, no schema
  validation). Accepted given the audience (family) and the one-day lifespan of the
  data; the admin view's manual-catch-correction is the fallback if something needs
  fixing, not a security boundary.

## Pre-Race Checklist
- Walk the course and verify cell signal at every planned main and bonus station
  location (no GPS coordinates needed — map placement is just icon positioning on
  whatever static image is supplied).
- Do a full end-to-end dry run (start scan → catch at each station → finish scan) on at
  least one iPhone and one Android device before race day, using the admin view's QR
  codes to test without needing to physically visit the course.
- Confirm laminated/weatherproofed clue cards (including the finish QR) and a way to
  stake/secure them against wind.
- Decide exactly where the finish QR gets posted — needs to not interfere with the
  actual race's real finish-line flow/congestion.
- Confirm enough hobby-horses/stick-ponies are on hand at the finish — one per expected
  participant, unconditionally (a headcount question, no counting-per-family needed) —
  and have someone assigned to hand them out.

## Risks & Open Decisions
These came out of an event-planner + technical review and are not yet resolved:
- **Scope vs. timeline**: the full feature set (both bonus stations, avatar polish, reveal
  animation) is ambitious for a tight build window. If time gets tight, the recommended
  cut is: bonus stations and animation polish slip first; start flow, main 5 stations,
  finish challenge, shared clock, and admin view are the non-negotiable core.
- ~~**Finish-line staffing**~~ — fully resolved: one hobby-horse per person,
  unconditionally. No counting, no matching items to catches, nothing to get wrong.
- **Kids' tangible payoff**: partially addressed by the ad-lib pivot — yelling the
  finished story/catchphrase at the finish is a real, kid-involving moment, not just a
  parent looking at a screen. Still worth deciding whether kids get a physical artifact
  too (sticker, stamped card) on top of that.
- **Day-of fallback for a broken station**: the admin view's manual-catch-correction
  (stations) and manual finish-trigger (finish) now cover the *digital* side of a
  failure for every route, including the finish QR specifically. Still no decided
  *physical* fallback (e.g., a backup clue/QR card) if a code is lost/destroyed
  outright — that half of the risk remains open.
- ~~**GPS accuracy in the field**~~ — moot now that the dynamic map/GPS is dropped.
- ~~**Ambiguity in when to read vs. yell the story**~~ — resolved by the finish QR: the
  scan itself is the trigger, not a self-directed decision.
