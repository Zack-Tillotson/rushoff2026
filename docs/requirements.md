# Rush Off 5k — Companion Site Requirements

## Background
The Rush Off 5k is an annual family fun run (mostly kids + siblings' families). This site
drives an in-course activity: a QR-code clue hunt with a Pokemon-style creature collection
mechanic, capped off with a silly tiered challenge at the finish line.

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
4. Scanning reveals a "catch" screen for that station's Pokemon **type**, then an animation/
   reveal picks a specific Pokemon of that type to add to the family's collection.
5. A family's collection grows over the course of the race as more clues are found.
6. At the finish line, families carry a themed item for each type they caught, for the
   final stretch.
7. Throughout, the organizer can monitor and control the event live via an **admin view**.

## Technical Architecture
- **Hosting**: Firebase Hosting serves the web app. Mobile web only — no app install;
  clue/start QR codes link directly to pages opened via each phone's native camera/QR
  scanner. Must work on mainstream iOS Safari and Android Chrome.
- **Data store**: Firebase **Realtime Database** as the single shared/central store for:
  - the race clock's state (start timestamp, running/stopped/reset),
  - family records (name, avatar, and their caught Pokemon per station),
  - so every family's phone and the admin view stay live-synced with the same shared
    state, with no page refresh needed (this is what makes a *shared* race clock and
    live admin monitoring possible).
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
- **Catch randomization**: a family's catch at a station is an independent random pick
  from that type's ~10-Pokemon pool, with replacement *across* families — so two
  different families can end up with the same specific Pokemon from the same station.
  This is expected, and is part of what makes the comparison view interesting.
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

### Clue stations & collection
- **5 main stations** along the course, one per popular/recognizable type: Fire, Water,
  Electric, Grass, Bug (Bug swapped in for Rock — Rock wasn't earning its spot on either
  popularity or recognizability, while Bug is the type most kids will already know as
  "the first thing you catch," and ties in nicely with a real outdoor find-things hunt).
- **2 bonus/hidden stations** for more dedicated Pokemon fans: Dragon + Ghost. These are
  optional/off-path finds, not required to complete the main set.
- Each type has a pool of ~10 possible Pokemon. Scanning a station's QR code shows a
  "catch the Pokemon" screen for that type, with some reveal UX (e.g. pokeball shake/open
  animation) before showing which specific Pokemon of that type was caught.
- Real Pokemon names/art will be used (site is private/family-only, non-commercial, not
  publicly shared or monetized).
- Comparison view after the race: given the small group, a simple shared view/table of
  who caught what — full-set completion, rare bonus catches, cross-family duplicates —
  is enough; no need for a heavyweight leaderboard system.

### Map & wayfinding (hint mechanism)
- A map view on the site shows icons for the 5 main station locations.
- The 2 bonus stations show only a general **area** on the map (not an exact pin) — this
  is the "hint": enough to guide a determined family without giving away the exact spot.
- This map view serves as the hint mechanism; no separate stuck-detection/timer-based hint
  trigger is needed on top of it.

### Finish-line challenge
- A themed physical item per type (e.g. a pool inflatable for Water) is staged at the
  finish. A family carries **one item per type they caught** for the final stretch —
  more types caught = more items to juggle for the last 100m. Families who caught fewer
  types have a lighter (easier) carry; nobody is excluded from the bit.
- Logistics: need themed items sourced/assigned for each of the 7 types before race day,
  plus a plan for how a volunteer matches items to a family's catches at the finish
  without causing a backup (see Risks & Open Decisions).

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
  - **Live view of all families/teams** and which Pokemon each has caught so far,
    updating in real time as families scan stations.
  - **Manually add/correct a catch** for a family — this is the fallback for a destroyed
    clue, a QR that won't scan, or a dispute, so a single physical/technical hiccup
    doesn't require rebuilding anything mid-event.
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
- Public/commercial deployment implications of using real Pokemon IP — revisit if this
  ever needs to be shared beyond the family.
- Live GPS tracking, race timing/results, or replacing any existing race-day tooling —
  there is no external race-day tech to integrate with; the race clock here is just for
  in-app tension, not official timing.
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
- Walk the course and verify cell signal at every planned main and bonus station location.
- Do a full end-to-end dry run (start scan → catch at each station → finish) on at least
  one iPhone and one Android device before race day.
- Confirm laminated/weatherproofed clue cards and a way to stake/secure them against wind.
- Decide and brief whoever is staffing the finish line on how they'll match a family's
  caught types to the correct carry items without causing a backup.

## Risks & Open Decisions
These came out of an event-planner + technical review and are not yet resolved:
- **Scope vs. timeline**: the full feature set (both bonus stations, avatar polish, reveal
  animation) is ambitious for a 5-day build. If time gets tight, the recommended cut is:
  bonus stations and animation polish slip first; start flow, main 5 stations, finish
  challenge, shared clock, and admin view are the non-negotiable core.
- **Finish-line staffing**: no plan yet for how a volunteer sorts/hands out the correct
  themed items per family without a queue forming as multiple families arrive close
  together.
- **Kids' tangible payoff**: right now the "catch" moment lives entirely on a parent's
  phone. Worth deciding whether kids get any physical artifact of their own (sticker,
  stamped card) so the memory isn't purely on someone else's screen.
- **Day-of fallback for a broken station**: the admin view's manual-catch-correction
  covers the *digital* side of a failure (QR won't scan, clue destroyed), but there's no
  decided physical fallback (e.g., a backup clue card) if the primary is lost outright.
