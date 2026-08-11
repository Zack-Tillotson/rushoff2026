"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useFamily } from "@/lib/hooks/useFamily";
import { useRaceClock, useElapsedMs } from "@/lib/hooks/useRaceClock";
import { STATIONS } from "@/data/stations";
import { getAvatar } from "@/data/avatars";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const router = useRouter();
  const { family } = useFamily();
  const clock = useRaceClock();
  const elapsed = useElapsedMs(clock);

  if (family === undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const caughtCount = family ? Object.keys(family.catches ?? {}).length : 0;

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🏃 Rush Off 5k
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline">Race Clock</Typography>
          <Typography variant="h2" sx={{ fontFamily: "monospace" }}>
            {formatElapsed(elapsed)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clock.status === "running"
              ? "Running"
              : clock.status === "stopped"
                ? "Stopped"
                : "Not started yet"}
          </Typography>
        </CardContent>
      </Card>

      {family ? (
        <Card>
          <CardContent>
            <Typography variant="h5">
              {getAvatar(family.avatarId)?.emoji} {family.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {caughtCount} / {STATIONS.length} found
            </Typography>
            {caughtCount < STATIONS.length && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                It&apos;s a there-and-back course — keep an eye out on your way back
                for anything you missed on the way out!
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button variant="contained" size="large" onClick={() => router.push("/start")}>
          Start the Hunt
        </Button>
      )}
    </Box>
  );
}
