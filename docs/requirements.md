# Rush Off 5k — Companion Site Requirements

## Background
The Rush Off 5k is an annual family fun run (mostly kids + siblings' families), themed
around its own premise: horse thieves who jump on a horse and rush off. This site drives
an in-course activity leaning into that — a QR-code hunt where each station teaches your
family a **secret command word**, building toward a Mad-Libs-style outlaw story that
your family yells aloud at the finish line to "start" their hobby-horse gallop.

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
4. Scanning reveals a reveal screen for that station's **word blank**, then an animation
   picks a specific word from that blank's pool to add to the family's story.
5. A family's story fills in over the course of the race as more clues are found —
   partial blanks show a placeholder until found.
6. At the finish line, a family scans a **finish QR code** that seals/completes their
   story and reveals it as one big final moment — ending in the shouted catchphrase —
   which is the "command" to carry one hobby-horse per word learned and gallop the
   final stretch. More words learned means more to juggle.
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
- **Word randomization**: a family's pick at a station is an independent random draw
  from that blank's ~10-word pool (~4 for bonus blanks), with replacement *across*
  families — so two different families can end up with the same word from the same
  station. This is expected, and is part of what makes the comparison view interesting.
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

### Clue stations & the story
- **5 main stations** along the course, one per word-blank type: `ADJECTIVE`,
  `PLURAL_NOUN`, `VERB`, `SOUND`, `NUMBER` — each a single silly word.
- **2 bonus/hidden stations** for bigger, sillier finds: `TITLE` and `CATCHPHRASE` —
  each a whole shouted phrase rather than a single word. These are optional/off-path
  finds, not required to complete the main story. Coat-color categories from the first
  draft of this theme are dropped entirely — see `docs/adlib-words.md`.
- Each blank has a pool of ~10 possible words (~4 for the bonus blanks). Scanning a
  station's QR code shows a reveal screen for that blank, with some reveal UX before
  showing which specific word was picked.
- All story text/words are original — no licensed IP involved, so no restrictions on
  sharing the site publicly if that ever comes up.
- The story itself (see `docs/adlib-words.md`) is a fixed Mad-Libs template — filled-in
  blanks show the picked word, unfilled ones show a placeholder, and the final
  `CATCHPHRASE` line is always last regardless of the order stations were found in.
- Comparison view after the race: given the small group, a simple shared view/table of
  who found what — full-story completion, rare bonus finds, cross-family duplicates —
  is enough; no need for a heavyweight leaderboard system.

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
  it seals/completes the family's story and shows it as one dramatic final reveal —
  ending in the shouted catchphrase — rather than families deciding for themselves when
  to read/yell it. This gives the moment a clear, unambiguous start (resolves the
  "when exactly do we read vs. yell it" ambiguity raised in review).
- Right after that reveal, a single prop type — hobby-horses/stick-ponies — staged at
  the finish. A family carries **one hobby-horse per word they learned** for the final
  stretch — more learned = more to juggle. Families who found fewer stations have a
  lighter (easier) carry; nobody is excluded from the bit.
- This is simpler to staff than a per-type-item design would be: a volunteer just counts
  and hands out the same prop type, no matching different items to different catches
  (this resolves the "finish-line staffing" risk flagged in the last iteration).
- Logistics: need enough hobby-horses on hand (up to 7 per family, worst case) before
  race day, plus a physical finish QR code posted at the finish — placement needs to
  not interfere with the actual race's real finish-line flow/congestion (see Pre-Race
  Checklist).

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
  - **Live view of all families/teams** and which words each has found so far,
    updating in real time as families scan stations.
  - **Manually add/correct a catch** for a family — this is the fallback for a destroyed
    clue, a QR that won't scan, or a dispute, so a single physical/technical hiccup
    doesn't require rebuilding anything mid-event.
  - **QR codes for every route** (start + all 7 stations + finish), rendered directly in
    the admin view so the organizer can test the whole flow — or hand their phone to
    someone else to scan — without needing the printed physical clues on hand. Useful
    both before race day (dry runs) and during the event (fixing a station on the fly).
- This is the organizer's single control point during the event, carried on the
  organizer's own phone — it's what lets one person "mind the store" without being
  physically present at every station.

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
- Confirm enough hobby-horses/stick-ponies are on hand at the finish (worst case: 7 per
  family), and brief whoever is staffing it — counting and handing out one prop type is
  simple, but still needs someone assigned.

## Risks & Open Decisions
These came out of an event-planner + technical review and are not yet resolved:
- **Scope vs. timeline**: the full feature set (both bonus stations, avatar polish, reveal
  animation) is ambitious for a tight build window. If time gets tight, the recommended
  cut is: bonus stations and animation polish slip first; start flow, main 5 stations,
  finish challenge, shared clock, and admin view are the non-negotiable core.
- ~~**Finish-line staffing**~~ — resolved by the Round-Up theme pivot: a single prop
  type (hobby-horses) means a volunteer just counts and hands out, no matching different
  items to different catches.
- **Kids' tangible payoff**: partially addressed by the ad-lib pivot — yelling the
  finished story/catchphrase at the finish is a real, kid-involving moment, not just a
  parent looking at a screen. Still worth deciding whether kids get a physical artifact
  too (sticker, stamped card) on top of that.
- **Day-of fallback for a broken station**: the admin view's manual-catch-correction
  covers the *digital* side of a failure (QR won't scan, clue destroyed), but there's no
  decided physical fallback (e.g., a backup clue card) if the primary is lost outright —
  this now also applies to the finish QR specifically, since that one's a single point
  of failure for the whole finale moment.
- ~~**GPS accuracy in the field**~~ — moot now that the dynamic map/GPS is dropped.
- ~~**Ambiguity in when to read vs. yell the story**~~ — resolved by the finish QR: the
  scan itself is the trigger, not a self-directed decision.
