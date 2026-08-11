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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stack from "@mui/material/Stack";
import { useFamily } from "@/lib/hooks/useFamily";
import { AVATARS } from "@/data/avatars";
import BackToHomeLink from "@/app/BackToHomeLink";

export default function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { uid, family } = useFamily();

  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (family) router.replace(returnTo);
  }, [family, returnTo, router]);

  if (family === undefined || uid === null || family) {
    return (
      <>
        <BackToHomeLink />
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
        avatarId,
        createdAt: Date.now(),
      });
      router.replace(returnTo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BackToHomeLink />
      <Box sx={{ p: 3, maxWidth: 480, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Hunt!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Enter your family/team name and pick an avatar to get started.
        </Typography>

        <TextField
          fullWidth
          label="Family / Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
          autoFocus
        />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Pick an avatar
        </Typography>
        <ToggleButtonGroup
          value={avatarId}
          exclusive
          onChange={(_, value) => value && setAvatarId(value)}
          sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}
        >
          {AVATARS.map((avatar) => (
            <ToggleButton key={avatar.id} value={avatar.id} sx={{ fontSize: 28 }}>
              {avatar.emoji}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

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
