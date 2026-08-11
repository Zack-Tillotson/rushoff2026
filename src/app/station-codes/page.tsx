"use client";

import { useMemo, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";
import { STATIONS } from "@/data/stations";

const START_CODE = {
  id: "start",
  title: "Start",
  path: "/start",
  blurb: "Saddle up. Your run starts now.",
};

const FINISH_CODE = {
  id: "finish",
  title: "Finish",
  path: "/finish",
  blurb: "Cross this line and join the gang.",
};

const STATION_BLURBS: Record<string, string> = {
  "1": "Good start. Keep going.",
  "2": "Good work, outlaws.",
  "3": "The next one won't be so easy!",
  "4": "Sharp eyes. Stay on the trail.",
  "5": "You're getting close now.",
  "6": "Secret found. Nice hustle.",
  "7": "Legendary find. Ride on.",
};

interface StationCode {
  id: string;
  title: string;
  path: string;
  blurb: string;
}

function toRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function StationCodesPage() {
  const origin = useSyncExternalStore(
    () => () => {},
    () => process.env.NEXT_PUBLIC_SITE_ORIGIN ?? window.location.origin,
    () => process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "",
  );

  const stationCodes = useMemo<StationCode[]>(
    () => [
      START_CODE,
      ...STATIONS.map((station) => ({
        id: station.id,
        title: station.kind === "main" ? `Clue #${station.id}` : `Secret Clue #${station.id}`,
        path: `/station/${station.id}`,
        blurb: STATION_BLURBS[station.id] ?? "Keep going.",
      })),
      FINISH_CODE,
    ],
    [],
  );

  const rows = useMemo(() => toRows(stationCodes, 3), [stationCodes]);

  if (!origin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Preparing printable codes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ "@media print": { display: "none" } }}>
        <Typography variant="h4" gutterBottom>
          Race QR Codes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Printable start, station, and finish QR codes, arranged in a 3-column grid.
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            "@media print": {
              pageBreakInside: "auto",
            },
          }}
        >
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={`row-${rowIndex}`}
                sx={{
                  "@media print": {
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  },
                }}
              >
                {Array.from({ length: 3 }).map((_, colIndex) => {
                  const code = row[colIndex];
                  return (
                    <TableCell
                      key={`cell-${rowIndex}-${colIndex}`}
                      sx={{
                        width: "33.33%",
                        p: 2,
                        verticalAlign: "top",
                        "@media print": {
                          p: 1,
                          breakInside: "avoid",
                          pageBreakInside: "avoid",
                        },
                      }}
                    >
                      {code ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            minHeight: 300,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            gap: 1,
                            "@media print": {
                              minHeight: "auto",
                              breakInside: "avoid",
                              pageBreakInside: "avoid",
                              pageBreakAfter: "auto",
                              boxShadow: "none",
                            },
                          }}
                        >
                          <Typography variant="h6">{code.title}</Typography>
                          <QRCodeSVG value={`${origin}${code.path}`} size={180} />
                          <Typography variant="body2" color="text.secondary">
                            {code.blurb}
                          </Typography>
                        </Paper>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
