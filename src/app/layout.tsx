import type { Metadata } from "next";
import { Rye } from "next/font/google";
import Box from "@mui/material/Box";
import ThemeRegistry from "./ThemeRegistry";
import BottomNav from "./BottomNav";
import "./globals.css";

// Western wanted-poster display font, used for headings/reveal moments only (see
// theme.ts typography overrides) — never body text, per architecture.md's Theming &
// Art Direction guidance. Requires network access to Google Fonts at build time.
const rye = Rye({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rye",
});

export const metadata: Metadata = {
  title: "Rush Off 5k",
  description: "Rush Off 5k companion app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={rye.variable}>
      <body>
        <ThemeRegistry>
          <Box sx={{ pb: 8 }}>{children}</Box>
          <BottomNav />
        </ThemeRegistry>
      </body>
    </html>
  );
}
