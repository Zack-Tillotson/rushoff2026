export type StationId = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export interface Station {
  id: StationId;
  kind: "main" | "secret"; // main = required to "prove worth"; secret = bonus credit
}

export const STATIONS: Station[] = [
  { id: "1", kind: "main" },
  { id: "2", kind: "main" },
  { id: "3", kind: "main" },
  { id: "4", kind: "main" },
  { id: "5", kind: "main" },
  { id: "6", kind: "secret" },
  { id: "7", kind: "secret" },
];

export const MAIN_STATIONS = STATIONS.filter((s) => s.kind === "main");
export const SECRET_STATIONS = STATIONS.filter((s) => s.kind === "secret");

export function getStation(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
