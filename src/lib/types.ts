import type { StationType } from "@/data/stations";

export interface Catch {
  pokemonId: string;
  caughtAt: number;
  manual?: boolean;
}

export interface Family {
  name: string;
  avatarId: string;
  createdAt: number;
  catches?: Partial<Record<StationType, Catch>>;
}

export type ClockStatus = "idle" | "running" | "stopped";

export interface RaceClock {
  status: ClockStatus;
  startedAt: number | null;
  stoppedAt: number | null;
}
