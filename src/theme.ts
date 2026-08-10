import { createTheme } from "@mui/material/styles";
import type { StationType } from "./data/stations";

// Outdoor daytime use — bias toward high contrast, avoid pure-white backgrounds that
// wash out in direct sunlight.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
    background: { default: "#f0f2f5" },
  },
});

// Per-type accent colors, used for Chip/Card accents — not full theme repaints.
export const TYPE_COLORS: Record<StationType, string> = {
  fire: "#e65100",
  water: "#0277bd",
  electric: "#f9a825",
  grass: "#2e7d32",
  bug: "#9e9d24",
  dragon: "#6a1b9a",
  ghost: "#3949ab",
};
