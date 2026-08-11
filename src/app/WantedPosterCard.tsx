import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { WANTED_POSTER_SX } from "@/theme";

// Shared reveal-card treatment for the app's highest-emotion moments: station catches,
// gold-cache finds, and the finish story reveal. Deliberately one component so all
// three feel like variations of the same system rather than unrelated UI patterns.
export default function WantedPosterCard({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <Card
      sx={{
        ...WANTED_POSTER_SX,
        ...(accentColor ? { borderColor: accentColor } : {}),
      }}
    >
      <CardContent sx={{ textAlign: "center" }}>{children}</CardContent>
    </Card>
  );
}
