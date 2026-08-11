# Rush Off 5k — Companion Site Requirements

## Background
The Rush Off 5k is an annual family fun run (mostly kids + siblings' families), themed
around its own premise: horse thieves who jump on a horse and rush off. This site drives
an in-course activity leaning into that: at the start line, the organizer tells everyone
this is a **tryout to join the famous outlaw gang** — to prove their worth, every family
must find the gang's **5 hidden clues** along the course, with extra credit for finding
**2 extra-secret clues** too. At the finish line, everyone who tried gets welcomed into
the outlaws and sets off on their hobby-horse gallop.

This replaces iteration 2's Mad-Libs/secret-word-story mechanic entirely — that turned
out to be more confusing than fun. There's no hidden twist anymore, no story being
secretly assembled behind the scenes. What you see is what it is: find clues, get
credit, join the gang at the end.

## Timeline
About a week out from this doc, race day is imminent. The full feature set below is
the current MVP target; see **Risks & Open Decisions** for the scope-cut option if time
runs short.

## Key Constraint
Parents/adults carry phones; kids generally do not. Any interaction that requires a phone
(scanning a QR code, viewing a collection) is mediated by a parent on behalf of their kid(s).
Kids do the physical finding; parents do the scanning/tapping.

## Core Concept
1. At the start line, the organizer explains the tryout in person: find the gang's 5
   clues to prove your worth, with 2 extra-secret clues worth bonus credit.
2. Each family scans a **start QR code** to begin their session/tracking on the site
   (reuses the same scan mechanic they'll use at every clue, so it's already been
   tested by the time it matters).
3. Paper clues (each with its own QR code) are hidden along the race course — 5 main
   clues, plus 2 extra-secret ones for the more determined.
4. Kids/families physically find a clue; a parent scans the QR code with their phone,
   which shows a simple confirmation: "You found Clue #3! One step closer to the gang."
   No random reveal, no word, no story — just credit for finding it.
5. A family's progress (which clues found) is visible any time on the collection screen.
6. At the finish line, a family scans a **finish QR code**, which welcomes them into the
   outlaw gang — showing how many of the 5 main clues and 2 secret clues they found —
   and is the cue to grab a hobby-horse and gallop the final stretch. Every participant
   gets exactly one hobby-horse, unconditionally, regardless of how many clues they found.
7. Throughout, the organizer can monitor and control the event live via an **admin
   view**, which also renders every route's QR code (start, all 7 clues, and finish)
   for testing on the organizer's own phone.

## Technical Architecture
- **Hosting**: Firebase Hosting serves the web app. Mobile web only — no app install;
  clue/start QR codes link directly to pages opened via each phone's native camera/QR
  scanner. Must work on mainstream iOS Safari and Android Chrome.
- **Data store**: Firebase **Realtime Database** as the single shared/central store for:
  - the race clock's state (start timestamp, running/stopped/reset),
  - family records (name, avatar, and which clues have been found),
  - so every family's phone and the admin view stay live-synced with the same shared
    state, with no page refresh needed (this is what makes a *shared* race clock and
    live admin monitoring possible).
- **Map**: a static course-image placeholder (no live map/GPS) — you supply the real
  map image directly.
- **Admin QR testing**: the admin view renders actual scannable QR codes for the start
  URL, all 7 clue URLs, and the finish URL, generated client-side — so the organizer
  can test (or let someone else scan) every step from their own phone without needing
  the printed physical clues on hand.
- **Session identity**: a family's data lives server-side in the Realtime Database,
  keyed by that device's Firebase Anonymous Auth id, which Firebase itself persists in
  the browser — so closing the tab or restarting the phone doesn't lose anything, as
  long as it's the same device/browser. A genuinely different device/browser (or
  cleared browser data) has no way to reconnect to an existing family's data and would
  start a new, blank one — accepted as a limitation given the event is same-day,
  same-device in practice, not a cross-device account system.
- **QR reuse**: each clue's physical QR code is shared by all families — it is **not**
  a single-use token. Every family that scans it independently gets their own credit
  recorded against their own family record. Multiple families can (and will) scan the
  same physical code over the course of the event.
- **No randomness**: unlike iteration 2, finding a clue doesn't reveal anything
  variable — it's just a found/not-found flag per clue, per family. Nothing to
  randomize, nothing to store beyond "found it, and when."
- **Scale**: ~5 family groups + 3 older kids is a handful of records and a low write
  volume — Realtime Database comfortably covers this; no additional backend needed.

## Decided Features

### Start flow / team identification
- Scanning the shared **start QR code** (posted at the start line) begins a family's
  session and starts tracking their progress — no manual team name typing required to
  *start*, but immediately after scanning, the family enters a **name** and picks a
  **picture/avatar** to represent them for the rest of the site (collection view, map,
  comparison view). This creates their record in the Realtime Database.
- Avatar picture set: for v1, a handful of **generic/default avatars** only (generated
  as part of this build). Custom per-family avatars are a follow-up, added later once
  supplied.

### Clue stations: 5 main + 2 extra-secret
- **5 main clues** along the course, simply numbered **1 through 5**. Finding all 5 is
  what "proves your worth" to join the gang.
- **2 extra-secret clues**, numbered **6 and 7** (continuing the same simple sequence —
  no separate naming scheme). These are optional/off-path finds that earn extra credit,
  not required to join the gang.
- Scanning a clue's QR code shows a simple, immediate confirmation — "You found Clue
  #3! One step closer to the gang." for a main clue, or similar extra-credit framing for
  clues 6/7 — with no random reveal, no item, no word. Just credit for the find.
- No licensed IP involved, so no restrictions on sharing the site publicly if that ever
  comes up.
- **Progress display is simple counts, not a point score**: "5/5 main clues found" and
  "2/2 extra-secret clues found," shown separately. No numeric scoring math anywhere in
  the app — keeping this simple was the whole point of the redesign.
- Comparison view after the race: given the small group, a simple shared view/table of
  who found what — main-clue completion, extra-secret finds, cross-family comparison —
  is enough; no need for a heavyweight leaderboard system.

### Map
- Shows the course map image **as-is, with no pins or overlays** — no per-clue
  positioning, no dynamic map library, no GPS, no live location. Tapping the map opens
  it full-size so participants can pinch-zoom using their phone's native image viewer.
  This replaces the earlier plan to mark clue locations on the map; the map is now
  purely "here's the course," not a hint mechanism.
- **There-and-back course**: the actual race route goes out and back along the same
  path, so every family passes every clue location twice. Rather than changing clue
  placement to avoid this, the app nudges families with copy — home, collection, and
  map screens all remind an incomplete family that anything unfound is worth a second
  look on the way back. Scanning is already idempotent, so passing an already-found
  clue a second time is harmless either way.

### Finish-line welcome & challenge
- A **finish QR code**, posted at the finish, is the trigger for the big moment:
  scanning it welcomes the family into the outlaw gang, showing how many main clues
  and extra-secret clues they found. This is a celebration, not a reveal of anything
  previously hidden — there's no twist to uncover anymore.
- Every participant gets **exactly one hobby-horse, unconditionally** — fixed, not
  scaled by how many clues were found. This is simpler than a scaled design in every
  way: no counting, no matching, nobody's carry looks different from anyone else's. It
  also fully resolves the "finish-line staffing" risk flagged in an earlier iteration —
  a volunteer just hands one out per person, full stop.
- Logistics: source enough hobby-horses for every expected participant (a headcount
  question, not something the app tracks), plus a physical finish QR code posted at the
  finish — placement needs to not interfere with the actual race's real finish-line
  flow/congestion (see Pre-Race Checklist).

### Race clock
- A single shared elapsed-time clock, backed by the Realtime Database. **Visible on the
  home page once the race has started** — before the gun goes off, the home page shows
  a simple "hasn't started yet" message instead of a running number; once the organizer
  starts the clock, every family's home page shows the live elapsed time, the same for
  everyone. Used purely for in-app tension, not as official race timing.
- Controlled via the admin view (start/stop/reset) — see below.

### Admin view
- A separate, organizer-only view of the site, not exposed to families as a normal part
  of the flow (simplest protection at this scale: an unlisted URL and/or a basic
  passcode — full user auth is not warranted for ~8 groups).
- Capabilities:
  - **Start / stop / reset** the shared race clock.
  - **Live view of all families/teams** and which of the 7 clues each has found so far,
    updating in real time as families scan.
  - **Manually mark a clue found/unfound for a family** — this is the fallback for a
    destroyed clue, a QR that won't scan, or a dispute, so a single physical/technical
    hiccup doesn't require rebuilding anything mid-event.
  - **Manually mark a family as finished** — the same idea, applied to the finish QR
    specifically: if it's destroyed, won't scan, or a family walks past it, the
    organizer can mark that family finished directly from the admin view, so the finish
    QR being a single point of failure doesn't block the welcome moment.
  - **QR codes for every route** (start + all 7 clues + finish), rendered directly in
    the admin view so the organizer can test the whole flow — or hand their phone to
    someone else to scan — without needing the printed physical clues on hand. Useful
    both before race day (dry runs) and during the event (fixing a clue on the fly).
- This is the organizer's single control point during the event, carried on the
  organizer's own phone — it's what lets one person "mind the store" without being
  physically present at every clue.

### Visual identity & polish
- The app should feel like *one* cohesive branded artifact — an Old West outlaw-gang
  tryout you're interacting with — not a generic app with themed copy pasted in. This
  matters most at the finish-line welcome moment, since that's the emotional peak of
  the whole experience and deserves the most visual polish.
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
  live during the event, and explains the tryout framing verbally at the start line
  (the app itself doesn't need to narrate the premise — the organizer does).

## Connectivity
- Cell signal along the course is expected to be reliable. No offline mode/caching is
  required for v1. Recommended: physically walk the course and check signal at each
  planned clue location before finalizing placement (see Pre-Race Checklist).

## Out of Scope
- Photo upload/sharing site (dropped).
- GPS/location of any kind. No live position, no race timing/results via GPS, no
  replacing any existing race-day tooling. The race clock here is just for in-app
  tension, not official timing.
- Stuck-detection, explicit "give me a hint" interaction, or any per-clue hint/wayfinding
  mechanism — the map is just a plain course reference now, not a hint system. Finding
  the physical clues is unassisted.
- Typing a team name as the *trigger* to start (the start QR scan is the trigger; name
  entry happens right after, as onboarding, not as the identification mechanic itself).
- Full user authentication/accounts for admin access — an unlisted URL/passcode is
  sufficient at this scale.
- Offline support / local caching of found-clue state.
- Any protection against data tampering — the shared database is open for read/write to
  anyone using the app for the week of the event (no per-family write locks, no schema
  validation). Accepted given the audience (family) and the one-day lifespan of the
  data; the admin view's manual-correction tools are the fallback if something needs
  fixing, not a security boundary.
- Any numeric point-scoring system — progress is shown as simple counts (X/5 main,
  Y/2 extra-secret), not a computed score. Explicitly rejected during this redesign as
  unnecessary complexity.
- Any random/variable reveal per clue (words, items, mini-stories) — iteration 2's
  approach, dropped for being confusing. A found clue is just found.

## Pre-Race Checklist
- Walk the course and verify cell signal at every planned clue location (the map is
  just a plain reference image now — no per-clue placement/coordinates to decide).
- Do a full end-to-end dry run (start scan → find each clue → finish scan) on at
  least one iPhone and one Android device before race day, using the admin view's QR
  codes to test without needing to physically visit the course.
- Confirm laminated/weatherproofed clue cards (including the finish QR) and a way to
  stake/secure them against wind.
- Decide exactly where the finish QR gets posted — needs to not interfere with the
  actual race's real finish-line flow/congestion.
- Confirm enough hobby-horses/stick-ponies are on hand at the finish — one per expected
  participant, unconditionally (a headcount question, no counting-per-family needed) —
  and have someone assigned to hand them out.
- Organizer prepares the short in-person explanation of the tryout premise for the
  start line — the app doesn't narrate this, so it needs to be said out loud.

## Risks & Open Decisions
- **Scope vs. timeline**: the full feature set (both extra-secret clues, art direction
  polish) is ambitious for a tight build window. If time gets tight, the recommended cut
  is: extra-secret clues and visual polish slip first; start flow, 5 main clues, finish
  welcome, shared clock, and admin view are the non-negotiable core.
- ~~**Finish-line staffing**~~ — fully resolved: one hobby-horse per person,
  unconditionally. No counting, no matching items to catches, nothing to get wrong.
- **Kids' tangible payoff**: the finish-line welcome-into-the-gang moment plus the
  hobby-horse gallop is the main kid-facing payoff. Still worth deciding whether kids
  get a physical artifact too (sticker, stamped card) on top of that.
- **Day-of fallback for a broken clue**: the admin view's manual-correction tools cover
  the *digital* side of a failure (QR won't scan, clue destroyed) for every route,
  including the finish QR specifically. Still no decided *physical* fallback (e.g., a
  backup clue/QR card) if a code is lost/destroyed outright — that half of the risk
  remains open.
- ~~**GPS accuracy in the field**~~ — moot, no dynamic map/GPS in this design.
- ~~**Ambiguity in when to reveal the story**~~ — moot, there's no story to reveal
  anymore.
