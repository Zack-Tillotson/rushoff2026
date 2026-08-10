import { notFound } from "next/navigation";
import { STATIONS, getStation } from "@/data/stations";
import StationCatch from "./StationCatch";

// Static export requires the full set of dynamic params known at build time — all 7
// station ids are fixed, so this is a non-issue (see architecture.md).
export function generateStaticParams() {
  return STATIONS.map((s) => ({ stationId: s.id }));
}
export const dynamicParams = false;

export default async function StationPage({
  params,
}: {
  params: Promise<{ stationId: string }>;
}) {
  const { stationId } = await params;
  const station = getStation(stationId);
  if (!station) notFound();

  return <StationCatch station={station} />;
}
