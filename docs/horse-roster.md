# Rush Off 5k — Horse Roster & Avatars

Finalized catch pool per station category, for the **Round-Up** theme (replaces the
Pokemon-themed roster from iteration 1). Ready to transcribe into `src/data/horses.ts`.
Main stations get a pool of 10 (more variety, since these are the "everyone finds
these" stations); bonus stations get a tighter pool of 4 (rarer/harder-to-find, so
fewer possible outcomes makes each one feel more special).

Each pool mixes plain, common ranch-horse names with one standout "jackpot" name per
category — a horse that's clearly more legendary than the rest — so the reveal moment
has some real variance in how exciting a catch feels, without most catches feeling like
a letdown. No licensed IP is involved (all names are original), so there's no
restriction on sharing the site publicly if that ever comes up.

## Main Stations (10 each)

### Bay
Copper, Ranger, Duke, Scout, Biscuit, Ember, Marshal, Cheyenne, Tumbleweed, **Sundance**

### Chestnut
Ginger, Rusty, Clover, Maple, Cinnamon, Autumn, Foxtrot, Whiskey, Blaze, **Comet**

### Black
Midnight, Shadow, Ace, Raven, Onyx, Outlaw, Jet, Inkwell, Coaltrain, **Phantom**

### Palomino
Goldie, Honey, Butterscotch, Sunflower, Marigold, Biscotti, Daffodil, Nugget, Amber,
**Sunburst**

### Pinto
Patches, Domino, Calico, Harlequin, Pepper, Bandit, Freckles, Checkers, Pinwheel,
**Renegade**

## Bonus Stations (4 each — rarer/exotic only)

### Appaloosa
Speckles, Thunderspot, Constellation, **Blizzard**

### Mustang (wild/untamed)
Wildfire, Freedom, Untamed, **Stormchaser**

## Generic Family Avatars
Unchanged from iteration 1 — non-theme emoji/icon avatars, represents *who the family
is*, distinct from *what they caught*:

🏃 Runner, 🏃‍♀️ Runner, 🦊 Fox, 🐻 Bear, 🐰 Rabbit, ⭐ Star, 🔥 Flame, ⚡ Bolt

Custom per-family avatars (photos) remain a deferred follow-up per `requirements.md`.

## Asset Sourcing Note
Iteration 1 pulled Pokemon sprites from a locally-cloned repo (`sprites`/`pokemon.json`)
— no equivalent exists for these original horse names, so **artwork/images for all 58
horses need to be sourced or generated from scratch** before this can be transcribed
into code. This is new work, not a copy-paste from an existing asset source like last
time — flag this early given the build timeline.

There's already one real brand asset: `public/horse-mascot-purple.png` — the actual
event's official logo (rope-circle badge, "3rd Annual Rush-Off 5k, 2026"). Not wired
into the app yet (holding off for now per iteration-2 decisions), but it's a good style
reference for the individual horse catch-art, and a candidate for the site header/
favicon later.
