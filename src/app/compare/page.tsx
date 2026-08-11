"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { useAllFamilies } from "@/lib/hooks/useAllFamilies";
import { useRaceClock } from "@/lib/hooks/useRaceClock";
import { formatElapsed } from "@/lib/formatElapsed";
import { getFinishTimeMs } from "@/lib/finishTime";
import { STATIONS } from "@/data/stations";
import { getAvatar } from "@/data/avatars";

export default function ComparePage() {
  const families = useAllFamilies();
  const clock = useRaceClock();

  // Fastest finish time first, for comparison; families that haven't finished yet
  // (or the race clock hasn't started) sort to the bottom.
  const sortedFamilies = [...families].sort((a, b) => {
    const aTime = getFinishTimeMs(a, clock);
    const bTime = getFinishTimeMs(b, clock);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime - bTime;
  });

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Compare Families
      </Typography>

      {families.length === 0 ? (
        <Typography color="text.secondary">
          No families have started yet.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Family</TableCell>
                {STATIONS.map((s) => (
                  <TableCell key={s.id} align="center">
                    {s.kind === "main" ? `#${s.id}` : `Secret #${s.id}`}
                  </TableCell>
                ))}
                <TableCell align="center">Total</TableCell>
                <TableCell align="center">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFamilies.map((family) => {
                const total = STATIONS.filter((s) => family.catches?.[s.id]).length;
                const timeMs = getFinishTimeMs(family, clock);
                const time = timeMs !== null ? formatElapsed(timeMs) : null;
                return (
                  <TableRow key={family.id}>
                    <TableCell>
                      {getAvatar(family.avatarId)?.emoji} {family.name}
                    </TableCell>
                    {STATIONS.map((station) => (
                      <TableCell key={station.id} align="center">
                        {family.catches?.[station.id] ? "✅" : "—"}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {total} / {STATIONS.length}
                    </TableCell>
                    <TableCell align="center">{time ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
