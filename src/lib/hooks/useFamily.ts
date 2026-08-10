"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getDb } from "@/lib/firebase";
import { useAuthUid } from "./useAuthUid";
import type { Family } from "@/lib/types";

interface UseFamilyResult {
  uid: string | null;
  family: Family | null | undefined; // undefined = still loading, null = doesn't exist yet
}

export function useFamily(): UseFamilyResult {
  const uid = useAuthUid();
  const [family, setFamily] = useState<Family | null | undefined>(undefined);

  useEffect(() => {
    if (!uid) return;
    const familyRef = ref(getDb(), `families/${uid}`);
    const unsubscribe = onValue(familyRef, (snapshot) => {
      setFamily(snapshot.exists() ? (snapshot.val() as Family) : null);
    });
    return unsubscribe;
  }, [uid]);

  return { uid, family };
}
