"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getDb } from "@/lib/firebase";
import type { RaceClock } from "@/lib/types";

const IDLE_CLOCK: RaceClock = { status: "idle", startedAt: null, stoppedAt: null };

export function useRaceClock(): RaceClock {
  const [clock, setClock] = useState<RaceClock>(IDLE_CLOCK);

  useEffect(() => {
    const clockRef = ref(getDb(), "race/clock");
    const unsubscribe = onValue(clockRef, (snapshot) => {
      setClock(snapshot.exists() ? (snapshot.val() as RaceClock) : IDLE_CLOCK);
    });
    return unsubscribe;
  }, []);

  return clock;
}

// Elapsed milliseconds, ticking locally between DB updates so we don't need a write
// every second just to move the clock.
export function useElapsedMs(clock: RaceClock): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (clock.status !== "running") return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [clock.status]);

  if (!clock.startedAt) return 0;
  const end = clock.status === "running" ? now : clock.stoppedAt ?? clock.startedAt;
  return Math.max(0, end - clock.startedAt);
}
