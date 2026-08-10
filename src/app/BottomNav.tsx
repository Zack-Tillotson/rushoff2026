"use client";

import { usePathname, useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";

const TABS = [
  { label: "Home", value: "/", icon: <HomeIcon /> },
  { label: "Map", value: "/map", icon: <MapIcon /> },
  { label: "Collection", value: "/collection", icon: <CatchingPokemonIcon /> },
  { label: "Compare", value: "/compare", icon: <LeaderboardIcon /> },
];

// Not shown on /start, /station/*, or /admin — those are single-purpose flows, not
// part of the everyday family navigation.
const HIDDEN_ON = ["/start", "/station", "/admin"];

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
