export type StationId = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export interface Station {
  id: StationId;
  kind: "main" | "secret"; // main = required to "prove worth"; secret = bonus credit
  // Position on public/course-map.png, as a percentage of the image's width/height.
  // TODO: placeholder estimates — finalize once physical clue placement is decided
  // (see docs/build-checklist.md Map Placement task).
  map: { x: number; y: number; radius?: number };
}

export const STATIONS: Station[] = [
  { id: "1", kind: "main", map: { x: 30, y: 45 } },
  { id: "2", kind: "main", map: { x: 45, y: 40 } },
  { id: "3", kind: "main", map: { x: 58, y: 33 } },
  { id: "4", kind: "main", map: { x: 68, y: 38 } },
  { id: "5", kind: "main", map: { x: 76, y: 48 } },
  // Secret clues are hidden/off-path — shown as an area, not an exact pin.
  { id: "6", kind: "secret", map: { x: 40, y: 15, radius: 8 } },
  { id: "7", kind: "secret", map: { x: 85, y: 20, radius: 8 } },
];

export const MAIN_STATIONS = STATIONS.filter((s) => s.kind === "main");
export const SECRET_STATIONS = STATIONS.filter((s) => s.kind === "secret");

export function getStation(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
