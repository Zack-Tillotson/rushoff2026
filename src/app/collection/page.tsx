"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useFamily } from "@/lib/hooks/useFamily";
import { MAIN_STATIONS, SECRET_STATIONS } from "@/data/stations";
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

  const foundSecretStations = SECRET_STATIONS.filter((s) => family.catches?.[s.id]);
  const mainFound = MAIN_STATIONS.filter((s) => family.catches?.[s.id]).length;
  const secretFound = foundSecretStations.length;
  const allMainFound = mainFound === MAIN_STATIONS.length;
  // Unfound secret clues are never shown — no placeholder card revealing they exist.
  const visibleStations = [...MAIN_STATIONS, ...foundSecretStations];

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Outlaw Progress
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This is your progress toward proving you have what it takes to join the gang.
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {mainFound}/{MAIN_STATIONS.length} clues found
        {secretFound > 0 &&
          ` — ${secretFound}/${SECRET_STATIONS.length} extra-secret clues found`}
        .
      </Typography>
      {allMainFound && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          You&apos;ve proven your worth! Head to the finish line to join the gang.
        </Typography>
      )}

      <Grid container spacing={2}>
        {visibleStations.map((station) => {
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
                  <List dense disablePadding>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {found ? (
                          <CheckCircleIcon sx={{ color: accentColor, fontSize: 18 }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ color: "text.disabled", fontSize: 18 }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ color: accentColor, fontWeight: 700 }}>
                            {label}
                          </Typography>
                        }
                        secondary={<Typography variant="body2">{found ? "Found" : "Not found yet"}</Typography>}
                      />
                    </ListItem>
                  </List>
                  <Divider sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
