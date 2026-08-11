"use client";

import { useState } from "react";
import { ref, set, remove } from "firebase/database";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { getDb } from "@/lib/firebase";
import { useRaceClock, useElapsedMs } from "@/lib/hooks/useRaceClock";
import { useAllFamilies } from "@/lib/hooks/useAllFamilies";
import { STATIONS } from "@/data/stations";
import { formatElapsed } from "@/lib/formatElapsed";
import AdminQrCodes from "./AdminQrCodes";

export default function AdminDashboard() {
  const clock = useRaceClock();
  const elapsed = useElapsedMs(clock);
  const families = useAllFamilies();

  const [familyId, setFamilyId] = useState("");
  const [stationId, setStationId] = useState(STATIONS[0].id);
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

  const selectedFamily = families.find((f) => f.id === familyId);
  const isFoundForSelected = Boolean(selectedFamily?.catches?.[stationId]);

  const markFound = async () => {
    if (!familyId) return;
    await set(ref(getDb(), `families/${familyId}/catches/${stationId}`), {
      caughtAt: Date.now(),
      manual: true,
    });
  };

  const markUnfound = async () => {
    if (!familyId) return;
    await remove(ref(getDb(), `families/${familyId}/catches/${stationId}`));
  };

  const submitManualFinish = async () => {
    if (!finishFamilyId) return;
    await set(ref(getDb(), `families/${finishFamilyId}/finishedAt`), Date.now());
    setFinishFamilyId("");
  };

  const getEventElapsedLabel = (eventAt: number | null | undefined): string => {
    if (!eventAt || !clock.startedAt) return "-";
    const elapsedMs = eventAt - clock.startedAt;
    return elapsedMs >= 0 ? formatElapsed(elapsedMs) : "-";
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
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        Right column shows race time (elapsed from clock start).
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        {families.map((family) => (
          <Card key={family.id} variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography variant="h6">
                  {family.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: family.finishedAt ? "success.main" : "text.secondary", fontWeight: 700 }}
                >
                  {family.finishedAt ? "Finished" : "Racing"}
                </Typography>
              </Stack>
              <List dense disablePadding>
                {STATIONS.map((s) => {
                  const caught = family.catches?.[s.id];
                  const label = s.kind === "main" ? `Clue #${s.id}` : `Secret clue #${s.id}`;
                  const labelWithManual = caught?.manual ? `${label} *` : label;
                  return (
                    <ListItem
                      key={s.id}
                      disablePadding
                      secondaryAction={
                        <Typography
                          variant="caption"
                          color={caught ? "primary.main" : "text.secondary"}
                          sx={{ fontWeight: caught ? 700 : 500, fontFamily: "monospace" }}
                        >
                          {getEventElapsedLabel(caught?.caughtAt)}
                        </Typography>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {caught ? (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2">{labelWithManual}</Typography>}
                      />
                    </ListItem>
                  );
                })}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <Typography
                      variant="caption"
                      color={family.finishedAt ? "primary.main" : "text.secondary"}
                      sx={{ fontWeight: family.finishedAt ? 700 : 500, fontFamily: "monospace" }}
                    >
                      {getEventElapsedLabel(family.finishedAt)}
                    </Typography>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    {family.finishedAt ? (
                      <CheckCircleIcon color="primary" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Finish</Typography>}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        * = manually added/corrected
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Manually Mark a Clue Found/Unfound
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 480, mb: 4 }}>
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
          <InputLabel>Clue</InputLabel>
          <Select
            label="Clue"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            {STATIONS.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.kind === "main" ? `Clue #${s.id}` : `Secret Clue #${s.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={markFound}
            disabled={!familyId || isFoundForSelected}
          >
            Mark Found
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={markUnfound}
            disabled={!familyId || !isFoundForSelected}
          >
            Mark Unfound
          </Button>
        </Stack>
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
