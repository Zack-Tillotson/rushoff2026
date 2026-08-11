"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ref, set } from "firebase/database";
import { getDb } from "@/lib/firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useFamily } from "@/lib/hooks/useFamily";
import BackToHomeLink from "@/app/BackToHomeLink";

export default function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { uid, family } = useFamily();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (family) router.replace(returnTo);
  }, [family, returnTo, router]);

  if (family === undefined || uid === null || family) {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  const handleSubmit = async () => {
    if (!uid || !name.trim()) return;
    setSubmitting(true);
    try {
      await set(ref(getDb(), `families/${uid}`), {
        name: name.trim(),
        createdAt: Date.now(),
      });
      router.replace(returnTo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3, mx: "auto" }}>
        <Box
          component="img"
          src="/horse-mascot-purple-circle.png"
          alt="Rush Off 5k logo"
          sx={{ width: 250, height: 250, objectFit: "contain", mb: 1 }}
        />
        <Typography variant="h4" gutterBottom>
          Join the Outlaws!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Enter a name to get started.
        </Typography>

        <TextField
          fullWidth
          label="Family / Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
          autoFocus
        />

        <Stack>
          <Button
            variant="contained"
            size="large"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Starting..." : "Join the race"}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
