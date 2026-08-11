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
import { STATIONS, MAIN_STATIONS, SECRET_STATIONS } from "@/data/stations";
import { CLUE_COLORS } from "@/theme";

// Simple found-so-far list — no story/word language, since there's no story anymore.
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

  const mainFound = MAIN_STATIONS.filter((s) => family.catches?.[s.id]).length;
  const secretFound = SECRET_STATIONS.filter((s) => family.catches?.[s.id]).length;
  const allMainFound = mainFound === MAIN_STATIONS.length;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Your Clues
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {mainFound}/{MAIN_STATIONS.length} clues found &mdash; {secretFound}/
        {SECRET_STATIONS.length} extra-secret clues found.
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {allMainFound
          ? "You've proven your worth! Head to the finish line to join the gang."
          : "Find all 5 clues to prove your worth to the gang."}
      </Typography>
      {!allMainFound && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This is a there-and-back course, so you'll pass every spot twice — anything
          still marked &ldquo;not found yet&rdquo; below is worth a second look on
          your way back.
        </Typography>
      )}

      <Grid container spacing={2}>
        {STATIONS.map((station) => {
          const found = Boolean(family.catches?.[station.id]);
          const accentColor = station.kind === "main" ? CLUE_COLORS.main : CLUE_COLORS.secret;
          const label = station.kind === "main" ? `Clue #${station.id}` : "Secret Clue";

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
                    {found ? "Found!" : "Not found yet"}
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
