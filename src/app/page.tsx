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
import { formatElapsed } from "@/lib/formatElapsed";
import { MAIN_STATIONS, SECRET_STATIONS } from "@/data/stations";
import { getAvatar } from "@/data/avatars";

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

  const mainFound = family
    ? MAIN_STATIONS.filter((s) => family.catches?.[s.id]).length
    : 0;
  const secretFound = family
    ? SECRET_STATIONS.filter((s) => family.catches?.[s.id]).length
    : 0;
  const hasStarted = clock.status === "running" || clock.status === "stopped";

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🤠 Rush Off 5k
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {hasStarted ? (
            <>
              <Typography variant="overline">Race Clock</Typography>
              <Typography variant="h2" sx={{ fontFamily: "monospace" }}>
                {formatElapsed(elapsed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {clock.status === "running" ? "Running" : "Stopped"}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              The race hasn&apos;t started yet — check back once the gun goes off!
            </Typography>
          )}
        </CardContent>
      </Card>

      {family ? (
        <Card>
          <CardContent>
            <Typography variant="h5">
              {getAvatar(family.avatarId)?.emoji} {family.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {mainFound}/{MAIN_STATIONS.length} clues found
            </Typography>
            {secretFound > 0 && (
              <Typography variant="body2" color="text.secondary">
                {secretFound}/{SECRET_STATIONS.length} extra-secret clues found
              </Typography>
            )}
            {mainFound < MAIN_STATIONS.length && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                It&apos;s a there-and-back course — keep an eye out on your way back
                for anything you missed on the way out!
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button variant="contained" size="large" onClick={() => router.push("/start")}>
          Join the race
        </Button>
      )}
    </Box>
  );
}
