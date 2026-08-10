"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { useFamily } from "@/lib/hooks/useFamily";
import { STATIONS } from "@/data/stations";
import { findCaughtPokemon } from "@/data/pokemon";
import { FINISH_ITEMS } from "@/data/finishItems";
import { TYPE_COLORS } from "@/theme";

export default function CollectionPage() {
  const router = useRouter();
  const { family } = useFamily();

  if (family === undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (family === null) {
    router.replace("/start?returnTo=/collection");
    return null;
  }

  const caughtTypes = STATIONS.filter((s) => family.catches?.[s.id]);

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Your Collection
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {caughtTypes.length} / {STATIONS.length} caught. Show this screen to the
        finish-line volunteer — it lists exactly what you get to carry!
      </Typography>

      <Grid container spacing={2}>
        {STATIONS.map((station) => {
          const caught = family.catches?.[station.id];
          const pokemon = caught
            ? findCaughtPokemon(station.type, caught.pokemonId)
            : null;

          return (
            <Grid key={station.id} size={{ xs: 6, sm: 4 }}>
              <Card
                variant="outlined"
                sx={{ opacity: pokemon ? 1 : 0.4, height: "100%" }}
              >
                {pokemon ? (
                  <CardMedia
                    component="img"
                    image={pokemon.sprite}
                    alt={pokemon.name}
                    sx={{ height: 100, objectFit: "contain", p: 1 }}
                  />
                ) : (
                  <Box sx={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="h4">?</Typography>
                  </Box>
                )}
                <CardContent sx={{ pt: 0 }}>
                  <Chip
                    size="small"
                    label={station.type}
                    sx={{ bgcolor: TYPE_COLORS[station.type], color: "white", mb: 1 }}
                  />
                  <Typography variant="body2">
                    {pokemon ? pokemon.name : "Not found yet"}
                  </Typography>
                  {pokemon && (
                    <Typography variant="caption" color="text.secondary">
                      Carry: {FINISH_ITEMS[station.type]}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
