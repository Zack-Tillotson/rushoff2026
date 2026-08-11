// Ad-lib story, word pools, and gold-cache pools — transcribed from docs/adlib-words.md.
// The story is a twist: nothing in the station-scanning flow should reference it.
// Only /finish assembles and reveals it.

export type BlankType = "adjective" | "pluralnoun" | "verb" | "sound" | "number";

export const STORY_TEMPLATE = (blanks: Record<BlankType, string>) =>
  `Down at Rush Off Ranch rode a ${blanks.adjective} horse thief. They'd swipe ${blanks.number} ${blanks.pluralnoun} before the sun came up, then leap on their horse, holler "${blanks.sound}!", and watch it ${blanks.verb} clean out of town. To this day, when the coast is clear, the gang still shouts their old rallying cry:`;

export const CATCHPHRASE = "Yeehaw or bust, partner!";

export interface WordEntry {
  id: string;
  word: string;
}

function words(...list: string[]): WordEntry[] {
  return list.map((word) => ({ id: word.toLowerCase().replace(/[^a-z0-9]+/g, "-"), word }));
}

export const WORD_POOLS: Record<BlankType, WordEntry[]> = {
  adjective: words(
    "Wobbly",
    "Sneaky",
    "Squeaky",
    "Dusty",
    "Lopsided",
    "Ticklish",
    "Grumpy",
    "Bouncy",
    "Cross-eyed",
    "Legendary"
  ),
  pluralnoun: words(
    "cowboy hats",
    "tumbleweeds",
    "horseshoes",
    "biscuits",
    "lassos",
    "saddlebags",
    "spurs",
    "canteens",
    "wanted posters",
    "gold nuggets"
  ),
  verb: words(
    "wiggle",
    "gallop",
    "moonwalk",
    "cartwheel",
    "hiccup",
    "boogie",
    "zigzag",
    "somersault",
    "sprint",
    "teleport"
  ),
  sound: words(
    "Yeehaw",
    "Whoosh",
    "Kaboom",
    "Ribbit",
    "Boing",
    "Vroom",
    "Ka-pow",
    "Hee-haw",
    "Ka-chow",
    "SHAZAM"
  ),
  number: words(
    "three",
    "twelve",
    "forty-seven",
    "a hundred",
    "a dozen",
    "seven-and-a-half",
    "eleventy",
    "a bajillion",
    "one million",
    "infinity-plus-one"
  ),
};

// Used when a family never found that blank's station — keeps the story readable
// rather than showing a raw placeholder.
export const BLANK_DEFAULTS: Record<BlankType, string> = {
  adjective: "Mysterious",
  pluralnoun: "secrets",
  verb: "vanish",
  sound: "Shhh",
  number: "countless",
};

export function findWord(blankType: BlankType, wordId: string): WordEntry | undefined {
  return WORD_POOLS[blankType].find((w) => w.id === wordId);
}

export function randomWord(blankType: BlankType): WordEntry {
  const pool = WORD_POOLS[blankType];
  return pool[Math.floor(Math.random() * pool.length)];
}

export type GoldCacheId = "gold1" | "gold2";

export const GOLD_CACHE_POOLS: Record<GoldCacheId, WordEntry[]> = {
  gold1: words(
    "a handful of gold dust",
    "a rusty gold coin",
    "a dusty gold nugget",
    "a chest overflowing with gold!"
  ),
  gold2: words(
    "a tarnished gold locket",
    "a bent gold spur",
    "a gold-plated belt buckle",
    "the legendary Rush Off Gold Bar!"
  ),
};

export function findGoldItem(cacheId: GoldCacheId, itemId: string): WordEntry | undefined {
  return GOLD_CACHE_POOLS[cacheId].find((w) => w.id === itemId);
}

export function randomGoldItem(cacheId: GoldCacheId): WordEntry {
  const pool = GOLD_CACHE_POOLS[cacheId];
  return pool[Math.floor(Math.random() * pool.length)];
}
