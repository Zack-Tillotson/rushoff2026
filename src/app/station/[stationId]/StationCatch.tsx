"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, set } from "firebase/database";
import { getDb } from "@/lib/firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import { useFamily } from "@/lib/hooks/useFamily";
import { randomPokemonFor, findCaughtPokemon } from "@/data/pokemon";
import type { Station } from "@/data/stations";
import { TYPE_COLORS } from "@/theme";

export default function StationCatch({ station }: { station: Station }) {
  const router = useRouter();
  const { uid, family } = useFamily();
  const [catching, setCatching] = useState(false);

  if (uid === null || family === undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (family === null) {
    router.replace(`/start?returnTo=/station/${station.id}`);
    return null;
  }

  const existingCatch = family.catches?.[station.id];

  const handleCatch = async () => {
    if (!uid) return;
    setCatching(true);
    const pokemon = randomPokemonFor(station.type);
    await set(ref(getDb(), `families/${uid}/catches/${station.id}`), {
      pokemonId: pokemon.id,
      caughtAt: Date.now(),
    });
    setCatching(false);
  };

  const caughtPokemon = existingCatch
    ? findCaughtPokemon(station.type, existingCatch.pokemonId)
    : null;

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
      <Typography
        variant="overline"
        sx={{ color: TYPE_COLORS[station.type], fontWeight: 700 }}
      >
        {station.type} station
      </Typography>
      <Typography variant="h4" gutterBottom>
        {station.name}
      </Typography>

      {caughtPokemon ? (
        <Grow in>
          <Card sx={{ mt: 2 }}>
            <CardMedia
              component="img"
              image={caughtPokemon.sprite}
              alt={caughtPokemon.name}
              sx={{ height: 220, objectFit: "contain", p: 2 }}
            />
            <CardContent>
              <Typography variant="h5">{caughtPokemon.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Already caught here!
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You found a {station.type} clue! Tap below to see what you caught.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleCatch}
            disabled={catching}
          >
            {catching ? "Catching..." : "Catch!"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
