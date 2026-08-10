# Rush Off 5k — Ad-Lib Story & Word Pools

Replaces `horse-roster.md` from earlier in iteration 2 — instead of catching a specific
named horse at each station, each station teaches your family one **secret command
word** that fills a blank in a Mad-Libs-style outlaw story. By the finish, your family
reads (or yells) their completed story, then does the hobby-horse gallop.

Nice side effect: this drops the "58 pieces of original horse artwork" problem entirely
— words don't need illustration, just display type. No asset-sourcing blocker anymore.

## The Story

```
Down at Rush Off Ranch rode a [ADJECTIVE] horse thief known far and wide as
[TITLE]. They'd swipe [NUMBER] [PLURAL_NOUN] before the sun came up, then leap on
their horse, holler "[SOUND]!", and watch it [VERB] clean out of town. To this
day, when the coast is clear, the gang still shouts their old rallying cry:

"[CATCHPHRASE]!"
```

- **5 main-station blanks** (single silly words): `ADJECTIVE`, `PLURAL_NOUN`, `VERB`,
  `SOUND`, `NUMBER`.
- **2 bonus-station blanks** (bigger, sillier — whole phrases, not single words):
  `TITLE`, `CATCHPHRASE`.
- The final `"[CATCHPHRASE]!"` line is the literal yell-it-and-run trigger at the finish
  — it's always last regardless of which order stations were actually found in.
- **Missing blanks** (station not found): render as a blank/placeholder — e.g. "...a
  ??? horse thief..." — rather than skipping the sentence, so a partial story is still
  readable/funny, not broken. Exact placeholder styling is an implementation detail.

## Word Pools

### ADJECTIVE (main, 10)
Wobbly, Sneaky, Squeaky, Dusty, Lopsided, Ticklish, Grumpy, Bouncy, Cross-eyed,
**Legendary**

### PLURAL_NOUN (main, 10)
cowboy hats, tumbleweeds, horseshoes, biscuits, lassos, saddlebags, spurs, canteens,
wanted posters, **gold nuggets**

### VERB (main, 10)
wiggle, gallop, moonwalk, cartwheel, hiccup, boogie, zigzag, somersault, sprint,
**teleport**

### SOUND (main, 10)
Yeehaw, Whoosh, Kaboom, Ribbit, Boing, Vroom, Ka-pow, Hee-haw, Ka-chow, **SHAZAM**

### NUMBER (main, 10)
three, twelve, forty-seven, a hundred, a dozen, seven-and-a-half, eleventy, a bajillion,
one million, **infinity-plus-one**

### TITLE (bonus, 4 — bigger/sillier)
"The Tumbleweed Terror", "Sheriff of Snooze-ville", "Duke of Dust",
**"The Legend of Legends"**

### CATCHPHRASE (bonus, 4 — bigger/sillier)
"Ride like the wind, ya varmints!", "Catch us if your boots can!", "This town ain't big
enough for a nap!", **"Yeehaw or bust, partner!"**

Each pool follows the same jackpot pattern as iteration 1's roster — mostly plain/silly
entries, with one clearly-more-legendary pick (bolded) so the reveal has some real
variance in excitement.

## Station Identity
Coat-color categories (Bay/Chestnut/etc.) are dropped. Stations are now identified by
their word-blank type directly: `adjective`, `pluralnoun`, `verb`, `sound`, `number`
(main) and `title`, `catchphrase` (bonus) — these become the station ids/routes (e.g.
`/station/adjective`), replacing `fire`/`water`/etc. from iteration 1.

## Generic Family Avatars
Unchanged — non-theme emoji/icon avatars, represents *who the family is*, distinct from
*what they collected*:

🏃 Runner, 🏃‍♀️ Runner, 🦊 Fox, 🐻 Bear, 🐰 Rabbit, ⭐ Star, 🔥 Flame, ⚡ Bolt

Custom per-family avatars (photos) remain a deferred follow-up per `requirements.md`.

## Brand Asset
`public/horse-mascot-purple.png` — the actual event's official logo (rope-circle badge,
"3rd Annual Rush-Off 5k, 2026"). Still not wired into the app per the decision to hold
off; noted here for whenever that changes.
