"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { QRCodeSVG } from "qrcode.react";
import { STATIONS } from "@/data/stations";

// Renders real, scannable QR codes for every route — start, all 7 stations, and
// finish (9 total) — so the organizer can test (or hand their phone to someone else to
// scan) without needing the printed physical clues on hand. Also doubles as the
// source for the physical printed clues themselves. Single column, stacked — this is
// a phone-first admin tool, and a multi-column grid of QR codes is fiddly to scan
// through on a narrow screen.
export default function AdminQrCodes() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  const routes = [
    { label: "Start", path: "/start" },
    ...STATIONS.map((s) => ({
      label: s.kind === "main" ? `Clue #${s.id}` : `Secret Clue #${s.id}`,
      path: `/station/${s.id}`,
    })),
    { label: "Finish", path: "/finish" },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        QR Codes ({routes.length})
      </Typography>
      <Stack spacing={2}>
        {routes.map((route) => (
          <Paper
            key={route.path}
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <QRCodeSVG value={`${origin}${route.path}`} size={96} />
            <Box>
              <Typography variant="subtitle1">{route.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {route.path}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
