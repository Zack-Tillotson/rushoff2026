export interface Catch {
  foundId: string;
  caughtAt: number;
  manual?: boolean;
}

export interface Family {
  name: string;
  avatarId: string;
  createdAt: number;
  finishedAt?: number | null;
  catches?: Record<string, Catch>;
}

export type ClockStatus = "idle" | "running" | "stopped";

export interface RaceClock {
  status: ClockStatus;
  startedAt: number | null;
  stoppedAt: number | null;
}
