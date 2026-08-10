# Rush Off 5k — Ad-Lib Story & Word Pools

Each of the 5 main stations belongs to a named wild horse — families are told they're
"learning that horse's secret command word," full stop. **The fact that this is
building toward a Mad-Libs story is a twist, held back until the finish-line reveal.**
Nothing in-course should say "story" or "blank" out loud — that's the surprise.

The 2 hidden/bonus stations are a totally separate side-collectible — **hidden gold
caches** — with no connection to the story at all. Finding them is just for bragging
rights in the comparison view.

Nice side effect kept from the last draft: no illustration/asset work needed — words
and treasure names are plain text.

## The Story (revealed only at `/finish`)

```
Down at Rush Off Ranch rode a [ADJECTIVE] horse thief. They'd swipe [NUMBER]
[PLURAL_NOUN] before the sun came up, then leap on their horse, holler
"[SOUND]!", and watch it [VERB] clean out of town. To this day, when the coast
is clear, the gang still shouts their old rallying cry:

"Yeehaw or bust, partner!"
```

- **5 blanks total, all from main stations**: `ADJECTIVE`, `PLURAL_NOUN`, `VERB`,
  `SOUND`, `NUMBER`. No blanks come from the gold-cache stations anymore.
- The closing catchphrase is **fixed and universal** — same line for every family,
  every time. It's not sourced from any station, so it's guaranteed to exist and be
  yell-able regardless of what anyone found. This is the "command" that starts the
  hobby-horse gallop.
- **Missing blanks default to a fixed value** (not a random pick, not a "???" — a
  specific, always-the-same word per blank type, listed below) so a partial story
  never looks broken. Given the expectation that most/all families reach all 5 main
  stations, this is mainly a safety net, not the common case.

## The 5 Horses (main stations)

Reveal copy pattern: *"You found [Horse]'s secret command word: '[word]'!"*

| Station id | Horse | Blank | Word pool (10) | Default (if missed) |
|---|---|---|---|---|
| `adjective` | **Sundance** | `ADJECTIVE` | Wobbly, Sneaky, Squeaky, Dusty, Lopsided, Ticklish, Grumpy, Bouncy, Cross-eyed, **Legendary** | Mysterious |
| `pluralnoun` | **Comet** | `PLURAL_NOUN` | cowboy hats, tumbleweeds, horseshoes, biscuits, lassos, saddlebags, spurs, canteens, wanted posters, **gold nuggets** | secrets |
| `verb` | **Phantom** | `VERB` | wiggle, gallop, moonwalk, cartwheel, hiccup, boogie, zigzag, somersault, sprint, **teleport** | vanish |
| `sound` | **Sunburst** | `SOUND` | Yeehaw, Whoosh, Kaboom, Ribbit, Boing, Vroom, Ka-pow, Hee-haw, Ka-chow, **SHAZAM** | Shhh |
| `number` | **Renegade** | `NUMBER` | three, twelve, forty-seven, a hundred, a dozen, seven-and-a-half, eleventy, a bajillion, one million, **infinity-plus-one** | countless |

The 5 horse names are reused from the very first horse-roster draft (each was that
color category's "jackpot" name) — a nice callback, and it means each station has a
character/identity without needing full art or a 10-horse-per-station roster.

Each word pool keeps the same jackpot pattern as before — mostly plain/silly entries,
one clearly-more-legendary pick (bolded), so the reveal has real variance in
excitement.

## Hidden Gold Caches (bonus stations)

Framed entirely as treasure-hunting, no horse/story connection. Reveal copy pattern:
*"You found a hidden gold cache: [item]!"*

| Station id | Pool (4, bigger/sillier) |
|---|---|
| `gold1` | a handful of gold dust, a rusty gold coin, a dusty gold nugget, **a chest overflowing with gold!** |
| `gold2` | a tarnished gold locket, a bent gold spur, a gold-plated belt buckle, **the legendary Rush Off Gold Bar!** |

No default values needed here — these are pure bonus, not required for anything at the
finish. Missing them just means missing them; nothing degrades.

## Finish-Line Reveal & Hobby-Horse Gallop
- Scanning the finish QR reveals the full story (5 blanks filled with whatever was
  found, defaults filling in the rest) for the first time — the "surprise, it's an
  ad-lib!" moment — ending in the universal shouted catchphrase.
- Every participant gets **exactly one hobby-horse, unconditionally** — not scaled by
  how many stations or gold caches were found. This is a fixed party favor, decided
  independently of the app; sourcing "how many hobby-horses to buy" is a headcount
  question for the organizer, not something the app tracks or gates.

## Generic Family Avatars
Unchanged — non-theme emoji/icon avatars, represents *who the family is*, distinct from
*what they collected*:

🏃 Runner, 🏃‍♀️ Runner, 🦊 Fox, 🐻 Bear, 🐰 Rabbit, ⭐ Star, 🔥 Flame, ⚡ Bolt

Custom per-family avatars (photos) remain a deferred follow-up per `requirements.md`.

## Brand Asset
`public/horse-mascot-purple.png` — the actual event's official logo (rope-circle badge,
"3rd Annual Rush-Off 5k, 2026"). Still not wired into the app per the decision to hold
off; noted here for whenever that changes.
