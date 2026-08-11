"use client";

import { useState } from "react";
import { ref, set } from "firebase/database";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { getDb } from "@/lib/firebase";
import { useRaceClock, useElapsedMs } from "@/lib/hooks/useRaceClock";
import { useAllFamilies } from "@/lib/hooks/useAllFamilies";
import { STATIONS } from "@/data/stations";
import { WORD_POOLS, GOLD_CACHE_POOLS, findWord, findGoldItem } from "@/data/adlib";
import { getAvatar } from "@/data/avatars";
import AdminQrCodes from "./AdminQrCodes";

export default function AdminDashboard() {
  const clock = useRaceClock();
  const elapsed = useElapsedMs(clock);
  const families = useAllFamilies();

  const [familyId, setFamilyId] = useState("");
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [foundId, setFoundId] = useState("");
  const [finishFamilyId, setFinishFamilyId] = useState("");

  const startClock = () =>
    set(ref(getDb(), "race/clock"), {
      status: "running",
      startedAt: Date.now(),
      stoppedAt: null,
    });
  const stopClock = () =>
    set(ref(getDb(), "race/clock"), { ...clock, status: "stopped", stoppedAt: Date.now() });
  const resetClock = () =>
    set(ref(getDb(), "race/clock"), { status: "idle", startedAt: null, stoppedAt: null });

  const station = STATIONS.find((s) => s.id === stationId)!;
  const foundOptions = station.kind === "horse" ? WORD_POOLS[station.id] : GOLD_CACHE_POOLS[station.id];

  const submitManualCatch = async () => {
    if (!familyId || !foundId) return;
    await set(ref(getDb(), `families/${familyId}/catches/${stationId}`), {
      foundId,
      caughtAt: Date.now(),
      manual: true,
    });
    setFoundId("");
  };

  const submitManualFinish = async () => {
    if (!finishFamilyId) return;
    await set(ref(getDb(), `families/${finishFamilyId}/finishedAt`), Date.now());
    setFinishFamilyId("");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Admin
      </Typography>

      <Typography variant="h6">Race Clock</Typography>
      <Typography variant="h3" sx={{ fontFamily: "monospace", mb: 1 }}>
        {Math.floor(elapsed / 60000)}:
        {Math.floor((elapsed % 60000) / 1000)
          .toString()
          .padStart(2, "0")}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={startClock} disabled={clock.status === "running"}>
          Start
        </Button>
        <Button variant="outlined" onClick={stopClock} disabled={clock.status !== "running"}>
          Stop
        </Button>
        <Button color="error" variant="outlined" onClick={resetClock}>
          Reset
        </Button>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" gutterBottom>
        Families ({families.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Family</TableCell>
              {STATIONS.map((s) => (
                <TableCell key={s.id} align="center">
                  {s.kind === "horse" ? s.horseName : "Gold"}
                </TableCell>
              ))}
              <TableCell align="center">Finished</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {families.map((family) => (
              <TableRow key={family.id}>
                <TableCell>
                  {getAvatar(family.avatarId)?.emoji} {family.name}
                </TableCell>
                {STATIONS.map((s) => {
                  const caught = family.catches?.[s.id];
                  const found = caught
                    ? s.kind === "horse"
                      ? findWord(s.id, caught.foundId)
                      : findGoldItem(s.id, caught.foundId)
                    : null;
                  return (
                    <TableCell key={s.id} align="center">
                      {found ? (caught?.manual ? `${found.word} *` : found.word) : "—"}
                    </TableCell>
                  );
                })}
                <TableCell align="center">{family.finishedAt ? "✅" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary">
        * = manually added/corrected
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Manually Add/Correct a Find
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 360, mb: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Family</InputLabel>
          <Select
            label="Family"
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
          >
            {families.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Station</InputLabel>
          <Select
            label="Station"
            value={stationId}
            onChange={(e) => {
              setStationId(e.target.value);
              setFoundId("");
            }}
          >
            {STATIONS.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.kind === "horse" ? s.horseName : "Gold Cache"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>{station.kind === "horse" ? "Word" : "Item"}</InputLabel>
          <Select
            label={station.kind === "horse" ? "Word" : "Item"}
            value={foundId}
            onChange={(e) => setFoundId(e.target.value)}
          >
            {foundOptions.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.word}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={submitManualCatch} disabled={!familyId || !foundId}>
          Save Find
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Manually Trigger a Finish
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Fallback for when the physical finish QR is broken or a family walks past it —
        marks a family finished directly, without them scanning.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ maxWidth: 480 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Family</InputLabel>
          <Select
            label="Family"
            value={finishFamilyId}
            onChange={(e) => setFinishFamilyId(e.target.value)}
          >
            {families
              .filter((f) => !f.finishedAt)
              .map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={submitManualFinish} disabled={!finishFamilyId}>
          Mark Finished
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <AdminQrCodes />
    </Box>
  );
}
