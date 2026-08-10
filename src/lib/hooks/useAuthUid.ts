"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";

// Anonymous auth is used purely as a convenient, stable per-device id — not as an
// access-control mechanism (RTDB rules are fully open; see database.rules.json).
export function useAuthUid(): string | null {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error("Anonymous sign-in failed", err);
        });
      }
    });
    return unsubscribe;
  }, []);

  return uid;
}
