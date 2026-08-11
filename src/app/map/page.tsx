"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { HORSE_STATIONS, GOLD_STATIONS } from "@/data/stations";
import { HORSE_COLORS, GOLD_COLOR } from "@/theme";

export default function MapPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Course Map
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Pins mark the {HORSE_STATIONS.length} wild horses. The shaded circles are the{" "}
        {GOLD_STATIONS.length} hidden gold caches — somewhere in that area, not marked
        exactly. That&apos;s the hint!
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1472 / 705",
          borderRadius: 2,
          backgroundImage: "url(/course-map.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      >
        {GOLD_STATIONS.map((station) => (
          <Box
            key={station.id}
            sx={{
              position: "absolute",
              left: `${station.map.x}%`,
              top: `${station.map.y}%`,
              width: `${station.map.radius * 2}%`,
              height: `${station.map.radius * 2}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              bgcolor: GOLD_COLOR[station.id],
              opacity: 0.35,
            }}
          />
        ))}

        {HORSE_STATIONS.map((station) => (
          <Tooltip key={station.id} title={station.horseName}>
            <Box
              sx={{
                position: "absolute",
                left: `${station.map.x}%`,
                top: `${station.map.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: HORSE_COLORS[station.id],
                border: "2px solid white",
                boxShadow: 2,
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
