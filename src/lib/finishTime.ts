import type { Family, RaceClock } from "@/lib/types";

// Elapsed ms from race start to when this family finished, for comparison — or null if
// unavailable/invalid. Invalid covers the case where finishedAt predates the current
// clock's startedAt (e.g. the admin reset/restarted the clock after some families had
// already finished under the previous epoch) — that would otherwise show a nonsensical
// negative duration.
export function getFinishTimeMs(family: Family, clock: RaceClock): number | null {
  if (!family.finishedAt || !clock.startedAt) return null;
  const elapsed = family.finishedAt - clock.startedAt;
  return elapsed >= 0 ? elapsed : null;
}
