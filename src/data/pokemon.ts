// Finalized roster — see pokemon-roster.md for the rationale behind each pick.
// Sprites are copied locally from the cloned `sprites` repo (official-artwork, by
// national dex number) into /public/pokemon/{dexNumber}.png — no live API calls needed.

import type { StationType } from "./stations";

export interface PokemonEntry {
  id: string; // slug, stable identifier stored in a family's catch record
  name: string;
  dexNumber: number;
  sprite: string; // path under /public
}

function entry(name: string, dexNumber: number): PokemonEntry {
  return {
    id: name.toLowerCase(),
    name,
    dexNumber,
    sprite: `/pokemon/${dexNumber}.png`,
  };
}

export const POKEMON_BY_TYPE: Record<StationType, PokemonEntry[]> = {
  bug: [
    entry("Caterpie", 10),
    entry("Weedle", 13),
    entry("Butterfree", 12),
    entry("Beedrill", 15),
    entry("Ledyba", 165),
    entry("Beautifly", 267),
    entry("Pinsir", 127),
    entry("Scyther", 123),
    entry("Heracross", 214),
    entry("Vivillon", 666),
  ],
  water: [
    entry("Squirtle", 7),
    entry("Totodile", 158),
    entry("Magikarp", 129),
    entry("Psyduck", 54),
    entry("Staryu", 120),
    entry("Vaporeon", 134),
    entry("Lapras", 131),
    entry("Gyarados", 130),
    entry("Blastoise", 9),
    entry("Kyogre", 382),
  ],
  grass: [
    entry("Bulbasaur", 1),
    entry("Chikorita", 152),
    entry("Oddish", 43),
    entry("Bellsprout", 69),
    entry("Exeggutor", 103),
    entry("Tangela", 114),
    entry("Venusaur", 3),
    entry("Sceptile", 254),
    entry("Leafeon", 470),
    entry("Celebi", 251),
  ],
  fire: [
    entry("Charmander", 4),
    entry("Cyndaquil", 155),
    entry("Vulpix", 37),
    entry("Growlithe", 58),
    entry("Ponyta", 77),
    entry("Magmar", 126),
    entry("Charizard", 6),
    entry("Arcanine", 59),
    entry("Flareon", 136),
    entry("Moltres", 146),
  ],
  electric: [
    entry("Pikachu", 25),
    entry("Pichu", 172),
    entry("Voltorb", 100),
    entry("Magnemite", 81),
    entry("Electabuzz", 125),
    entry("Jolteon", 135),
    entry("Raichu", 26),
    entry("Ampharos", 181),
    entry("Luxray", 405),
    entry("Zapdos", 145),
  ],
  ghost: [
    entry("Gastly", 92),
    entry("Gengar", 94),
    entry("Mimikyu", 778),
    entry("Giratina", 487),
  ],
  dragon: [
    entry("Dratini", 147),
    entry("Dragonite", 149),
    entry("Garchomp", 445),
    entry("Rayquaza", 384),
  ],
};

export function randomPokemonFor(type: StationType): PokemonEntry {
  const pool = POKEMON_BY_TYPE[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function findCaughtPokemon(
  type: StationType,
  pokemonId: string
): PokemonEntry | undefined {
  return POKEMON_BY_TYPE[type].find((p) => p.id === pokemonId);
}
