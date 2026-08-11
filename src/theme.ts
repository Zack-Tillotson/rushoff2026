import { createTheme } from "@mui/material/styles";
import type { BlankType, GoldCacheId } from "./data/adlib";

// Outdoor daytime use — bias toward high contrast, avoid pure-white backgrounds that
// wash out in direct sunlight. Display font ("Rye", loaded in layout.tsx) is used only
// for headings/reveal moments — body/UI text stays on the default sans-serif for
// legibility, per architecture.md's Theming & Art Direction guidance.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
    background: { default: "#f0f2f5" },
  },
  typography: {
    h1: { fontFamily: "var(--font-rye), serif" },
    h2: { fontFamily: "var(--font-rye), serif" },
    h3: { fontFamily: "var(--font-rye), serif" },
    h4: { fontFamily: "var(--font-rye), serif" },
    h5: { fontFamily: "var(--font-rye), serif" },
    h6: { fontFamily: "var(--font-rye), serif" },
  },
});

// Per-horse accent colors, pulled from one cohesive Western palette rather than
// arbitrary hues, plus a shared gold accent for both cache stations. Used for
// Chip/Card accents — not full theme repaints.
export const HORSE_COLORS: Record<BlankType, string> = {
  adjective: "#c2612a", // Sundance — dusty orange
  pluralnoun: "#6d4c2f", // Comet — saddle brown
  verb: "#4a2f6d", // Phantom — twilight purple
  sound: "#b8860b", // Sunburst — sunset gold
  number: "#5a7247", // Renegade — sagebrush green
};

export const GOLD_COLOR: Record<GoldCacheId, string> = {
  gold1: "#a67c1e",
  gold2: "#a67c1e",
};

// Shared "wanted poster" treatment for the highest-emotion moments (station reveal,
// gold-cache reveal, finish story reveal) — parchment background + rope-inspired
// border, so all three read as one system. See WantedPosterCard.tsx.
export const WANTED_POSTER_SX = {
  bgcolor: "#f4e8d0",
  border: "4px double #5a4127",
  borderRadius: 2,
  boxShadow: 3,
};
