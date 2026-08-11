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
import type { Station } from "@/data/stations";
import { CLUE_COLORS } from "@/theme";
import WantedPosterCard from "@/app/WantedPosterCard";
import BackToHomeLink from "@/app/BackToHomeLink";

// No random reveal, no words, no items — a clue is just found or not found. Copy
// matches docs/clue-copy.md exactly.
export default function StationCatch({ station }: { station: Station }) {
  const router = useRouter();
  const { uid, family } = useFamily();
  const [marking, setMarking] = useState(false);
  const [justFound, setJustFound] = useState(false);

  useEffect(() => {
    if (family === null) router.replace(`/start?returnTo=/station/${station.id}`);
  }, [family, router, station.id]);

  if (uid === null || family === undefined || family === null) {
    return (
      <>
        <BackToHomeLink />
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  const alreadyFound = Boolean(family.catches?.[station.id]);
  const accentColor = station.kind === "main" ? CLUE_COLORS.main : CLUE_COLORS.secret;

  const handleFind = async () => {
    if (!uid) return;
    setMarking(true);
    await set(ref(getDb(), `families/${uid}/catches/${station.id}`), {
      caughtAt: Date.now(),
    });
    setJustFound(true);
    setMarking(false);
  };

  return (
    <>
      <BackToHomeLink />
      <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
        <Typography variant="overline" sx={{ color: accentColor, fontWeight: 700 }}>
          {station.kind === "main" ? "Gang Clue" : "Extra-Secret Clue"}
        </Typography>
        <Typography variant="h4" gutterBottom>
          Clue #{station.id}
        </Typography>

        {alreadyFound ? (
          <Grow in>
            <Box sx={{ mt: 2 }}>
              <WantedPosterCard accentColor={accentColor}>
                {justFound ? (
                  <Typography variant="h5">
                    {station.kind === "main"
                      ? `You found Clue #${station.id}! One step closer to the gang.`
                      : "You found a secret clue! Extra credit for a future outlaw."}
                  </Typography>
                ) : (
                  <Typography variant="h5">
                    {station.kind === "main"
                      ? `Clue #${station.id} — already found!`
                      : "Secret clue already found — nice work!"}
                  </Typography>
                )}
              </WantedPosterCard>
            </Box>
          </Grow>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {station.kind === "main"
                ? "Tap below to mark this clue found."
                : "You found an extra-secret clue! Tap below for bonus credit."}
            </Typography>
            <Button variant="contained" size="large" onClick={handleFind} disabled={marking}>
              {marking ? "..." : "Found It!"}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
