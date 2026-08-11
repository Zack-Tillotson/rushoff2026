"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, set } from "firebase/database";
import { getDb } from "@/lib/firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import { useFamily } from "@/lib/hooks/useFamily";
import { randomWord, findWord, randomGoldItem, findGoldItem } from "@/data/adlib";
import type { Station } from "@/data/stations";
import { HORSE_COLORS, GOLD_COLOR } from "@/theme";
import WantedPosterCard from "@/app/WantedPosterCard";

// Reveal copy is deliberately horse-taming / treasure-hunting only — never mentions a
// "story" or "blank." The ad-lib nature is a twist held back until /finish.
export default function StationCatch({ station }: { station: Station }) {
  const router = useRouter();
  const { uid, family } = useFamily();
  const [catching, setCatching] = useState(false);

  useEffect(() => {
    if (family === null) router.replace(`/start?returnTo=/station/${station.id}`);
  }, [family, router, station.id]);

  if (uid === null || family === undefined || family === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const existingCatch = family.catches?.[station.id];

  const handleFind = async () => {
    if (!uid) return;
    setCatching(true);
    const found =
      station.kind === "horse" ? randomWord(station.id) : randomGoldItem(station.id);
    await set(ref(getDb(), `families/${uid}/catches/${station.id}`), {
      foundId: found.id,
      caughtAt: Date.now(),
    });
    setCatching(false);
  };

  const foundEntry = existingCatch
    ? station.kind === "horse"
      ? findWord(station.id, existingCatch.foundId)
      : findGoldItem(station.id, existingCatch.foundId)
    : null;

  const accentColor = station.kind === "horse" ? HORSE_COLORS[station.id] : GOLD_COLOR[station.id];

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
      {station.kind === "horse" ? (
        <>
          <Typography variant="overline" sx={{ color: accentColor, fontWeight: 700 }}>
            Wild Horse
          </Typography>
          <Typography variant="h4" gutterBottom>
            {station.horseName}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="overline" sx={{ color: accentColor, fontWeight: 700 }}>
            Hidden Gold Cache
          </Typography>
          <Typography variant="h4" gutterBottom>
            You found something!
          </Typography>
        </>
      )}

      {foundEntry ? (
        <Grow in>
          <Box sx={{ mt: 2 }}>
            <WantedPosterCard accentColor={accentColor}>
              {station.kind === "horse" ? (
                <>
                  <Typography variant="h5">
                    {station.horseName}&apos;s secret command word:
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    &ldquo;{foundEntry.word}&rdquo;
                  </Typography>
                </>
              ) : (
                <Typography variant="h5">You found: {foundEntry.word}</Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Already found here!
              </Typography>
            </WantedPosterCard>
          </Box>
        </Grow>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {station.kind === "horse"
              ? `You found ${station.horseName}! Tap below to learn its secret command word.`
              : "Tap below to see what's inside the cache."}
          </Typography>
          <Button variant="contained" size="large" onClick={handleFind} disabled={catching}>
            {catching ? "..." : station.kind === "horse" ? "Tame the Horse!" : "Open the Cache!"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
