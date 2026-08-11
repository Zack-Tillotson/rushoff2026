"use client";

import { usePathname, useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

// Themed icon swap at the highest-visibility spot (bottom nav) only, per
// architecture.md's Theming & Art Direction scope tiers — a sheriff's-badge-style icon
// for "Collection" instead of the leftover Pokemon-specific one. Custom lasso/horseshoe
// iconography beyond this is explicitly deferred as nice-to-have.
const TABS = [
  { label: "Home", value: "/", icon: <HomeIcon /> },
  { label: "Map", value: "/map", icon: <MapIcon /> },
  { label: "Collection", value: "/collection", icon: <WorkspacePremiumIcon /> },
];

// Not shown on /start, /station/*, /finish, or /admin — those are single-purpose
// flows, not part of the everyday family navigation.
const HIDDEN_ON = ["/start", "/station", "/finish", "/admin"];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10 }}
    >
      <BottomNavigation
        showLabels
        value={pathname}
        onChange={(_, newValue) => router.push(newValue)}
      >
        {TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
