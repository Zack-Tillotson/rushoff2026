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
import { STATIONS } from "@/data/stations";
import { getAvatar } from "@/data/avatars";

export default function ComparePage() {
  const families = useAllFamilies();

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
              </TableRow>
            </TableHead>
            <TableBody>
              {families.map((family) => {
                const total = STATIONS.filter((s) => family.catches?.[s.id]).length;
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
