import type { Metadata } from "next";
import Box from "@mui/material/Box";
import ThemeRegistry from "./ThemeRegistry";
import BottomNav from "./BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rush Off 5k",
  description: "Rush Off 5k companion app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Box sx={{ pb: 8 }}>{children}</Box>
          <BottomNav />
        </ThemeRegistry>
      </body>
    </html>
  );
}
