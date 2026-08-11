"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, set } from "firebase/database";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import Divider from "@mui/material/Divider";
import { getDb } from "@/lib/firebase";
import { useFamily } from "@/lib/hooks/useFamily";
import { STORY_TEMPLATE, CATCHPHRASE, BLANK_DEFAULTS, findWord } from "@/data/adlib";
import type { BlankType } from "@/data/adlib";
import WantedPosterCard from "@/app/WantedPosterCard";

const BLANK_TYPES: BlankType[] = ["adjective", "pluralnoun", "verb", "sound", "number"];

// Finish QR lands here. First visit reveals the twist (this was an ad-lib all along)
// and sets finishedAt; re-visits just re-show the same reveal — idempotent, grants no
// new word, and is unrelated to gold-cache finds. See architecture.md's Pages/Routes.
export default function FinishPage() {
  const router = useRouter();
  const { uid, family } = useFamily();
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
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const blanks = BLANK_TYPES.reduce(
    (acc, blankType) => {
      const caught = family.catches?.[blankType];
      const word = caught ? findWord(blankType, caught.foundId)?.word : undefined;
      acc[blankType] = word ?? BLANK_DEFAULTS[blankType];
      return acc;
    },
    {} as Record<BlankType, string>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 560, mx: "auto", textAlign: "center" }}>
      <Typography variant="overline" sx={{ fontWeight: 700 }}>
        The Truth Revealed
      </Typography>
      <Typography variant="h4" gutterBottom>
        You've been telling a legend all along...
      </Typography>

      <Grow in>
        <Box sx={{ mt: 3 }}>
          <WantedPosterCard>
            <Typography variant="body1" sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}>
              {STORY_TEMPLATE(blanks)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h4">"{CATCHPHRASE}"</Typography>
          </WantedPosterCard>
        </Box>
      </Grow>

      <Typography variant="body1" sx={{ mt: 4 }}>
        Now grab your hobby-horse and gallop to the finish — yell it loud!
      </Typography>
    </Box>
  );
}
