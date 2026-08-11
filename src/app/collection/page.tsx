"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { useFamily } from "@/lib/hooks/useFamily";
import { STATIONS } from "@/data/stations";
import { findWord, findGoldItem } from "@/data/adlib";
import { HORSE_COLORS, GOLD_COLOR } from "@/theme";

// Framed the same way as the stations themselves — a found-so-far list, never
// mentioning "story" or "blank." The ad-lib nature stays a secret until /finish.
export default function CollectionPage() {
  const router = useRouter();
  const { family } = useFamily();

  useEffect(() => {
    if (family === null) router.replace("/start?returnTo=/collection");
  }, [family, router]);

  if (family === undefined || family === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const foundCount = STATIONS.filter((s) => family.catches?.[s.id]).length;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Your Finds
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {foundCount} / {STATIONS.length} found so far. Once you've found all 5 wild
        horses, head to the finish line for a big surprise!
      </Typography>
      {foundCount < STATIONS.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This is a there-and-back course, so you'll pass every spot twice — anything
          still marked &ldquo;not found yet&rdquo; below is worth a second look on
          your way back.
        </Typography>
      )}

      <Grid container spacing={2}>
        {STATIONS.map((station) => {
          const caught = family.catches?.[station.id];
          const found = caught
            ? station.kind === "horse"
              ? findWord(station.id, caught.foundId)
              : findGoldItem(station.id, caught.foundId)
            : null;
          const accentColor =
            station.kind === "horse" ? HORSE_COLORS[station.id] : GOLD_COLOR[station.id];
          const label = station.kind === "horse" ? station.horseName : "Gold Cache";

          return (
            <Grid key={station.id} size={{ xs: 6, sm: 4 }}>
              <Card variant="outlined" sx={{ opacity: found ? 1 : 0.4, height: "100%" }}>
                <Box
                  sx={{
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h4">{found ? "✓" : "?"}</Typography>
                </Box>
                <CardContent sx={{ pt: 0 }}>
                  <Chip
                    size="small"
                    label={label}
                    sx={{ bgcolor: accentColor, color: "white", mb: 1 }}
                  />
                  <Typography variant="body2">
                    {found ? found.word : "Not found yet"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
