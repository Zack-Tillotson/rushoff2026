"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, set } from "firebase/database";
import { getDb } from "@/lib/firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import { useFamily } from "@/lib/hooks/useFamily";
import type { Station } from "@/data/stations";
import { CLUE_COLORS } from "@/theme";
import WantedPosterCard from "@/app/WantedPosterCard";
import BackToHomeLink from "@/app/BackToHomeLink";

// No random reveal, no words, no items — a clue is just found or not found. Just
// visiting this page is enough to record it, no button tap required. Copy matches
// docs/clue-copy.md.
export default function StationCatch({ station }: { station: Station }) {
  const router = useRouter();
  const { uid, family } = useFamily();
  // Snapshot of whether this clue was already found *before* this visit — captured
  // once, so we can tell "just found it now" from "already found it before" even
  // though the auto-write below makes both look the same in the DB.
  const [wasAlreadyFound, setWasAlreadyFound] = useState<boolean | null>(null);

  useEffect(() => {
    if (family === null) {
      router.replace(`/start?returnTo=/station/${station.id}`);
      return;
    }
    if (!uid || !family || wasAlreadyFound !== null) return;
    const found = Boolean(family.catches?.[station.id]);
    setWasAlreadyFound(found);
    if (!found) {
      set(ref(getDb(), `families/${uid}/catches/${station.id}`), {
        caughtAt: Date.now(),
      });
    }
  }, [uid, family, wasAlreadyFound, router, station.id]);

  if (uid === null || family === undefined || family === null || wasAlreadyFound === null) {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  const accentColor = station.kind === "main" ? CLUE_COLORS.main : CLUE_COLORS.secret;

  return (
    <>
      <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
        <Typography variant="overline" sx={{ color: accentColor, fontWeight: 700 }}>
          {station.kind === "main" ? "Gang Clue" : "Extra-Secret Clue"}
        </Typography>
        <Typography variant="h4" gutterBottom>
          Clue #{station.id}
        </Typography>

        <Grow in>
          <Box sx={{ mt: 2 }}>
            <WantedPosterCard accentColor={accentColor}>
              {wasAlreadyFound ? (
                <Typography variant="h5">
                  {station.kind === "main"
                    ? `Clue #${station.id} — already found!`
                    : "Secret clue already found — nice work!"}
                </Typography>
              ) : (
                <Typography variant="h5">
                  {station.kind === "main"
                    ? `You found Clue #${station.id}! One step closer to the gang.`
                    : "You found a secret clue! Extra credit for a future outlaw."}
                </Typography>
              )}
            </WantedPosterCard>
          </Box>
        </Grow>
      </Box>
    </>
  );
}
