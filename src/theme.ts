import { createTheme } from "@mui/material/styles";

// Outdoor daytime use — bias toward high contrast, avoid pure-white backgrounds that
// wash out in direct sunlight. Display font ("Rye", loaded in layout.tsx) is used only
// for headings/the finish welcome moment — body/UI text stays on the default
// sans-serif for legibility, per architecture.md's Theming & Art Direction guidance.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#9b74bb",
      light: "#b89ad1",
      dark: "#7a569b",
      contrastText: "#120a1f",
    },
    secondary: {
      main: "#6b4a92",
      light: "#8f70b5",
      dark: "#4f3570",
    },
    background: {
      default: "#f5f0fa",
      paper: "#ffffff",
    },
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
  main: "#8a63b0", // mascot purple accent
  secret: "#6b4a92", // deeper purple for secret clues
} as const;

// Shared "wanted poster" treatment for the highest-emotion moments (clue found,
// finish welcome) — parchment background + rope-inspired border, so both read as one
// system. See WantedPosterCard.tsx.
export const WANTED_POSTER_SX = {
  bgcolor: "#fbf8ff",
  border: "4px double #7a569b",
  borderRadius: 2,
  boxShadow: "0 8px 20px rgba(122, 86, 155, 0.25)",
};
