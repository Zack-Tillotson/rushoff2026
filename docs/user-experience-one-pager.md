  # Rush Off 5k 2026 - User Experience One-Pager

  ## Experience in One Sentence
  Families experience a fast, low-friction "outlaw gang tryout" where kids hunt physical clues, parents scan QR codes, and everyone gets a celebratory finish-line welcome no matter their clue count.

  ## Who This Experience Is For
  - Parents and adult siblings: use their phones to scan QR codes, check progress, view the course map, and see race clock tension.
  - Kids: do the real-world challenge (finding clues) and get the main emotional payoff at the finish-line welcome and hobby-horse gallop.
  - Organizer: runs race-day operations from an unlisted admin screen with live visibility and manual fallbacks.

  ## Core UX Promise
  - Simple to understand in under 30 seconds at the start line.
  - One action to get credit at clues (scan only, no extra taps).
  - No confusion mechanics (no hidden story assembly, no random reveal payload).
  - Encouraging for everyone: participation is celebrated even with partial completion.

  ## Race-Day Journey

  ### 1. Start-Line Framing (in person + first scan)
  The organizer explains the premise out loud: "find 5 clues to prove your worth, with 2 extra-secret clues for bonus credit." Families then scan a shared start QR code and immediately enter a family name.

  UX intent:
  - The start QR proves scanning works before clues matter.
  - Name entry is lightweight onboarding, not a blocker before scanning.
  - Families are in quickly and can begin moving.

  ### 2. On-Course Hunt (scan, confirm, continue)
  Kids find physical clue cards. A parent scans the clue QR and lands on a confirmation page. Credit is recorded automatically on page load.

  For main clues (1-5), confirmation is explicit and motivating ("You found Clue #3! One step closer to the gang.").
  For extra-secret clues (6-7), confirmation frames them as bonus wins.

  UX intent:
  - Preserve momentum: no button press after scanning.
  - Keep feedback immediate, consistent, and celebratory.
  - Support a there-and-back course with idempotent scans (re-scans are harmless).

  ### 3. Progress and Navigation During the Run
  Families can check their own progress any time on Collection and use Map for course reference.

  Progress is shown as simple counts:
  - main clues: X/5
  - extra-secret clues: Y/2

  Secret-clue visibility rule:
  - If a family has found no secret clues, the app does not mention secret clues at all.
  - Once they find one, only discovered secret progress appears.

  UX intent:
  - Avoid score complexity and comparison pressure.
  - Protect the surprise of hidden bonus content.
  - Encourage second-look behavior on the return leg without over-guiding.

  ### 4. Finish-Line Moment (scan to celebrate)
  At the finish, families scan a finish QR code that triggers a welcome screen: "Welcome to the gang!" It shows their found-clue counts and personal elapsed time (when valid), then cues the physical payoff: grab a hobby-horse and rush off.

  UX intent:
  - Make the finish scan the emotional peak.
  - Celebrate effort, not ranking.
  - Keep outcomes inclusive: every participant gets exactly one hobby-horse, unconditionally.

  ## Organizer Experience (Operational UX)
  The organizer uses a dedicated admin screen as a live control center:
  - Start/stop/reset shared race clock.
  - Monitor all families and clue progress in real time.
  - Manually mark clues found/unfound when a physical clue or QR fails.
  - Manually mark families finished if finish scan is missed.
  - Use built-in scannable QR codes for start, all clues, and finish for testing or rapid replacement.

  UX intent:
  - One-person operability during a live event.
  - Rapid recovery from day-of failures without technical intervention.
  - Confidence from visible, shared state across all phones.

  ## Experience Principles to Preserve
  - Mobile-first and outdoor legibility: clear contrast, large tap targets, fast page load.
  - One coherent brand voice: outlaw-gang tryout tone across copy, styling, and finish celebration.
  - Minimal cognitive load: every screen answers "what just happened" and "what should we do next" immediately.
  - No cross-family comparison in family-facing views: each family sees only its own progress and finish context.

  ## Success Criteria (User-Centered)
  - A first-time family can start, scan a clue, and see confirmation without assistance.
  - Families do not ask "did that count?" after scans.
  - Kids perceive a clear payoff at finish regardless of clue totals.
  - Organizer can keep event flow moving even if a clue card or QR station fails.
