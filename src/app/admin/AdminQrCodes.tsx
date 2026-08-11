"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { QRCodeSVG } from "qrcode.react";
import { STATIONS } from "@/data/stations";

// Renders real, scannable QR codes for every route — start, all 7 stations, and
// finish (9 total) — so the organizer can test (or hand their phone to someone else to
// scan) without needing the printed physical clues on hand. Also doubles as the
// source for the physical printed clues themselves.
export default function AdminQrCodes() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  const routes = [
    { label: "Start", path: "/start" },
    ...STATIONS.map((s) => ({
      label: s.kind === "horse" ? s.horseName : "Gold Cache",
      path: `/station/${s.id}`,
    })),
    { label: "Finish", path: "/finish" },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        QR Codes ({routes.length})
      </Typography>
      <Grid container spacing={2}>
        {routes.map((route) => (
          <Grid key={route.path} size={{ xs: 6, sm: 4, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {route.label}
              </Typography>
              <QRCodeSVG value={`${origin}${route.path}`} size={128} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                {route.path}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
