# Rush Off 5k — Clue Copy & Avatars

Replaces iteration 2's ad-lib story/word-pool doc — this redesign has no story, no
words, no random reveals. A clue is just found or not found. This doc is just the
exact copy shown at each moment, so it's consistent everywhere it's transcribed into
code.

## The Premise (explained by the organizer, in person, at the start line)
The app itself never narrates this — it's said out loud before the race starts:

> "This is a tryout to join the famous Rush Off outlaw gang! To prove your worth,
> find the gang's 5 hidden clues along the course. Keep your eyes open for 2
> extra-secret clues too — those are worth bonus credit for real outlaws. Cross the
> finish line and scan one more code to find out if you're in!"

## Clue Stations

### Main clues — ids `1` through `5`
Reveal copy on first find: **"You found Clue #{id}! One step closer to the gang."**
Already-found copy on re-visit: **"Clue #{id} — already found!"**

### Extra-secret clues — ids `6` and `7`
Reveal copy on first find: **"You found a secret clue! Extra credit for a future
outlaw."**
Already-found copy on re-visit: **"Secret clue already found — nice work!"**

No random word, item, or reveal — every family sees the exact same copy for a given
clue. The only per-family variability is *which* clues they've found, not *what* they
found.

## Finish-Line Welcome
Scanning the finish QR shows, for the first time, this welcome screen (idempotent —
re-scanning shows the same thing, doesn't reset anything):

> **"Welcome to the gang!"**
>
> You found **{mainCount}/5** clues and **{secretCount}/2** extra-secret clues.
> The gang's impressed either way — grab your horse and rush off!

- `mainCount`/`secretCount` are just counts of `catches/1`–`catches/5` and
  `catches/6`–`catches/7` that exist for the family — no scoring math.
- No "you failed" framing regardless of how few clues were found — everyone who tries
  gets welcomed in. The clue count is bragging-rights flavor, not a gate.
- Every participant gets exactly one hobby-horse, unconditionally — not tied to the
  clue count at all (that's a physical headcount decision, not something the app
  tracks — see `requirements.md`).

## Generic Family Avatars
Unchanged — non-theme emoji/icon avatars, represents *who the family is*, distinct from
what they've found:

🏃 Runner, 🏃‍♀️ Runner, 🦊 Fox, 🐻 Bear, 🐰 Rabbit, ⭐ Star, 🔥 Flame, ⚡ Bolt

Custom per-family avatars (photos) remain a deferred follow-up per `requirements.md`.

## Brand Asset
`public/horse-mascot-purple.png` — the actual event's official logo (rope-circle badge,
"3rd Annual Rush-Off 5k, 2026"). Still not wired into the app per the earlier decision
to hold off; noted here for whenever that changes.
