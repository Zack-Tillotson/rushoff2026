"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AdminDashboard from "./AdminDashboard";

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE;

export default function AdminPage() {
  const [entered, setEntered] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <Box sx={{ p: 3, maxWidth: 360, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Admin
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Passcode"
            type="password"
            value={entered}
            onChange={(e) => setEntered(e.target.value)}
            autoFocus
          />
          <Button
            variant="contained"
            onClick={() => setUnlocked(entered === ADMIN_PASSCODE)}
          >
            Enter
          </Button>
        </Stack>
      </Box>
    );
  }

  return <AdminDashboard />;
}
