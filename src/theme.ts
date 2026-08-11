import { createTheme } from "@mui/material/styles";

// Outdoor daytime use — bias toward high contrast, avoid pure-white backgrounds that
// wash out in direct sunlight. Display font ("Rye", loaded in layout.tsx) is used only
// for headings/the finish welcome moment — body/UI text stays on the default
// sans-serif for legibility, per architecture.md's Theming & Art Direction guidance.
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

// Simplified from iteration 2: no more per-horse-named palette (clues don't have
// individual identities anymore) — just two accent colors, one per clue kind.
export const CLUE_COLORS = {
  main: "#c2612a", // dusty orange
  secret: "#a67c1e", // antique gold
} as const;

// Shared "wanted poster" treatment for the highest-emotion moments (clue found,
// finish welcome) — parchment background + rope-inspired border, so both read as one
// system. See WantedPosterCard.tsx.
export const WANTED_POSTER_SX = {
  bgcolor: "#f4e8d0",
  border: "4px double #5a4127",
  borderRadius: 2,
  boxShadow: 3,
};
