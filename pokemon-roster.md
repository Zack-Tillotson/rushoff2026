# Rush Off 5k — Pokemon Roster & Avatars

Finalized catch pool per station type, ready to transcribe into `src/data/pokemon.ts`
(see `architecture.md`). Main stations get a pool of 10 (more variety, since these are
the "everyone finds these" stations); bonus stations get a tighter pool of 4 (since
they're the rarer/harder-to-find stations for more dedicated fans — fewer possible
outcomes makes each one feel more special).

Each pool mixes common/cute picks with a few stronger ones, and — where there's a
genuinely iconic one — a single rare "jackpot" legendary/mythical, so the reveal moment
has some real variance in how exciting a catch feels, without most catches feeling like
a letdown. A few pools deliberately include a baby-form/evolved-form pair from the same
family (e.g. Magikarp/Gyarados) for a nice "wait, that's the same line?!" moment when two
families compare catches.

## Main Stations (10 each)

### Bug
Caterpie, Weedle, Butterfree, Beedrill, Ledyba, Beautifly, Pinsir, Scyther, Heracross,
Vivillon
*(No legendary jackpot — Bug's legendaries are too obscure for a casual/kid audience;
Scyther/Heracross serve as the "cool" tier instead.)*

### Water
Squirtle, Totodile, Magikarp, Psyduck, Staryu, Vaporeon, Lapras, Gyarados, Blastoise,
Kyogre

### Grass
Bulbasaur, Chikorita, Oddish, Bellsprout, Exeggutor, Tangela, Venusaur, Sceptile,
Leafeon, Celebi

### Fire
Charmander, Cyndaquil, Vulpix, Growlithe, Ponyta, Magmar, Charizard, Arcanine, Flareon,
Moltres

### Electric
Pikachu, Pichu, Voltorb, Magnemite, Electabuzz, Jolteon, Raichu, Ampharos, Luxray, Zapdos

## Bonus Stations (4 each — most popular/iconic only)

### Ghost
Gastly, Gengar, Mimikyu, Giratina

### Dragon
Dratini, Dragonite, Garchomp, Rayquaza

## Generic Family Avatars
Non-Pokemon emoji/icon avatars — represents *who the family is*, distinct from *what
they caught*, so there's no confusion with the catch mechanic. Fast to source (no custom
art), zero IP concerns, instantly recognizable. A couple are running-themed to tie into
the 5k itself:

🏃 Runner, 🏃‍♀️ Runner, 🦊 Fox, 🐻 Bear, 🐰 Rabbit, ⭐ Star, 🔥 Flame, ⚡ Bolt

Custom per-family avatars (photos) remain a deferred follow-up per `requirements.md`.
