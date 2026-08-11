import type { BlankType, GoldCacheId } from "./adlib";

interface HorseStation {
  id: BlankType;
  kind: "horse";
  horseName: string;
  isBonus: false;
  map: { x: number; y: number };
}

interface GoldCacheStation {
  id: GoldCacheId;
  kind: "gold";
  isBonus: true;
  map: { x: number; y: number; radius: number };
}

export type Station = HorseStation | GoldCacheStation;

// Map x/y are percentages of public/course-map.png (1472x705), placed roughly along
// the real route (start west near Broadlands pond, finish east near W 136th Ave) as a
// starting estimate. TODO per build-checklist.md: finalize against actual physical
// clue placement once decided (Pre-Race Checklist / Map Placement task) — these are
// not final.
export const STATIONS: Station[] = [
  { id: "adjective", kind: "horse", horseName: "Sundance", isBonus: false, map: { x: 30, y: 45 } },
  { id: "pluralnoun", kind: "horse", horseName: "Comet", isBonus: false, map: { x: 45, y: 40 } },
  { id: "verb", kind: "horse", horseName: "Phantom", isBonus: false, map: { x: 58, y: 33 } },
  { id: "sound", kind: "horse", horseName: "Sunburst", isBonus: false, map: { x: 68, y: 38 } },
  { id: "number", kind: "horse", horseName: "Renegade", isBonus: false, map: { x: 76, y: 48 } },
  // Gold caches are hidden/off-path — shown as an area, not an exact pin.
  { id: "gold1", kind: "gold", isBonus: true, map: { x: 40, y: 15, radius: 8 } },
  { id: "gold2", kind: "gold", isBonus: true, map: { x: 85, y: 20, radius: 8 } },
];

export const HORSE_STATIONS = STATIONS.filter((s): s is HorseStation => s.kind === "horse");
export const GOLD_STATIONS = STATIONS.filter((s): s is GoldCacheStation => s.kind === "gold");

export function getStation(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
