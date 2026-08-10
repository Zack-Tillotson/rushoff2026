"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getDb } from "@/lib/firebase";
import type { Family } from "@/lib/types";

export interface FamilyWithId extends Family {
  id: string;
}

export function useAllFamilies(): FamilyWithId[] {
  const [families, setFamilies] = useState<FamilyWithId[]>([]);

  useEffect(() => {
    const familiesRef = ref(getDb(), "families");
    const unsubscribe = onValue(familiesRef, (snapshot) => {
      const val = (snapshot.val() as Record<string, Family> | null) ?? {};
      setFamilies(Object.entries(val).map(([id, family]) => ({ id, ...family })));
    });
    return unsubscribe;
  }, []);

  return families;
}
