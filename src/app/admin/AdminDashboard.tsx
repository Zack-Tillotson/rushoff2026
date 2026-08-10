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
import { POKEMON_BY_TYPE, findCaughtPokemon } from "@/data/pokemon";
import { getAvatar } from "@/data/avatars";

export default function AdminDashboard() {
  const clock = useRaceClock();
  const elapsed = useElapsedMs(clock);
  const families = useAllFamilies();

  const [familyId, setFamilyId] = useState("");
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [pokemonId, setPokemonId] = useState("");

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
  const pokemonOptions = POKEMON_BY_TYPE[station.type];

  const submitManualCatch = async () => {
    if (!familyId || !pokemonId) return;
    await set(ref(getDb(), `families/${familyId}/catches/${stationId}`), {
      pokemonId,
      caughtAt: Date.now(),
      manual: true,
    });
    setPokemonId("");
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
                  {s.type}
                </TableCell>
              ))}
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
                  const pokemon = caught
                    ? findCaughtPokemon(s.type, caught.pokemonId)
                    : null;
                  return (
                    <TableCell key={s.id} align="center">
                      {pokemon ? (caught?.manual ? `${pokemon.name} *` : pokemon.name) : "—"}
                    </TableCell>
                  );
                })}
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
        Manually Add/Correct a Catch
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
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
              setPokemonId("");
            }}
          >
            {STATIONS.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} ({s.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Pokemon</InputLabel>
          <Select
            label="Pokemon"
            value={pokemonId}
            onChange={(e) => setPokemonId(e.target.value)}
          >
            {pokemonOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={submitManualCatch} disabled={!familyId || !pokemonId}>
          Save Catch
        </Button>
      </Stack>
    </Box>
  );
}
