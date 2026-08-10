export type StationType =
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "bug"
  | "dragon"
  | "ghost";

export interface Station {
  id: StationType; // one station per type, so the type doubles as the station id
  type: StationType;
  name: string;
  isBonus: boolean;
  // Position on the static course map, as a percentage of the map image's
  // width/height (0-100). TODO: replace with real values once the course map
  // image and actual clue locations are finalized (see Pre-Race Checklist).
  map: { x: number; y: number; radius?: number };
}

export const STATIONS: Station[] = [
  { id: "fire", type: "fire", name: "Fire Station", isBonus: false, map: { x: 15, y: 20 } },
  { id: "water", type: "water", name: "Water Station", isBonus: false, map: { x: 35, y: 60 } },
  { id: "electric", type: "electric", name: "Electric Station", isBonus: false, map: { x: 55, y: 30 } },
  { id: "grass", type: "grass", name: "Grass Station", isBonus: false, map: { x: 70, y: 70 } },
  { id: "bug", type: "bug", name: "Bug Station", isBonus: false, map: { x: 85, y: 40 } },
  // Bonus stations only show a general area (radius), not an exact pin — see requirements.md.
  { id: "dragon", type: "dragon", name: "??? Station", isBonus: true, map: { x: 25, y: 80, radius: 12 } },
  { id: "ghost", type: "ghost", name: "??? Station", isBonus: true, map: { x: 60, y: 15, radius: 12 } },
];

export const MAIN_STATIONS = STATIONS.filter((s) => !s.isBonus);
export const BONUS_STATIONS = STATIONS.filter((s) => s.isBonus);

export function getStation(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
