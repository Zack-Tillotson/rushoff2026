"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, set } from "firebase/database";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import { getDb } from "@/lib/firebase";
import { useFamily } from "@/lib/hooks/useFamily";
import { useRaceClock } from "@/lib/hooks/useRaceClock";
import { formatElapsed } from "@/lib/formatElapsed";
import { getFinishTimeMs } from "@/lib/finishTime";
import { MAIN_STATIONS, SECRET_STATIONS } from "@/data/stations";
import WantedPosterCard from "@/app/WantedPosterCard";
import BackToHomeLink from "@/app/BackToHomeLink";

// Finish QR lands here. First visit sets finishedAt and welcomes the family into the
// gang; re-visits just re-show the same welcome — idempotent, grants no new find.
// No story, no twist — just a celebration. See docs/clue-copy.md for exact copy.
export default function FinishPage() {
  const router = useRouter();
  const { uid, family } = useFamily();
  const clock = useRaceClock();
  const [settingFinished, setSettingFinished] = useState(false);

  const alreadyFinished = Boolean(family?.finishedAt);

  useEffect(() => {
    if (family === null) {
      router.replace("/start?returnTo=/finish");
      return;
    }
    if (!uid || !family || alreadyFinished || settingFinished) return;
    setSettingFinished(true);
    set(ref(getDb(), `families/${uid}/finishedAt`), Date.now());
  }, [uid, family, alreadyFinished, settingFinished, router]);

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

  const mainCount = MAIN_STATIONS.filter((s) => family.catches?.[s.id]).length;
  const secretCount = SECRET_STATIONS.filter((s) => family.catches?.[s.id]).length;
  // Just for fun tension, not official race timing.
  const finishTimeMs = getFinishTimeMs(family, clock);
  const finishTime = finishTimeMs !== null ? formatElapsed(finishTimeMs) : null;

  return (
    <>
      <BackToHomeLink />
      <Box sx={{ p: 3, maxWidth: 560, mx: "auto", textAlign: "center" }}>
        <Grow in>
          <Box sx={{ mt: 3 }}>
            <WantedPosterCard>
              <Typography variant="h3" gutterBottom>
                Welcome to the gang!
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                You found {mainCount}/{MAIN_STATIONS.length} clues
                {secretCount > 0 &&
                  ` and ${secretCount}/${SECRET_STATIONS.length} extra-secret clues`}
                .
              </Typography>
              {finishTime && (
                <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
                  Your time: {finishTime}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mt: 2 }}>
                The gang&apos;s impressed either way — grab your horse and rush off!
              </Typography>
            </WantedPosterCard>
          </Box>
        </Grow>
      </Box>
    </>
  );
}
