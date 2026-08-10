import type { StationType } from "./stations";

// Themed physical item carried for the final stretch, one per type caught.
// TODO: update labels once items are actually sourced (see requirements.md
// Finish-line challenge / Pre-Race Checklist).
export const FINISH_ITEMS: Record<StationType, string> = {
  fire: "Flame pool noodle",
  water: "Pool inflatable",
  electric: "Glow stick bundle",
  grass: "Leafy pool float",
  bug: "Big bug backpack",
  dragon: "Dragon wings",
  ghost: "Ghost sheet cape",
};
