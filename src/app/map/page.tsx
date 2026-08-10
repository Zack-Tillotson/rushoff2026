"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { STATIONS, MAIN_STATIONS, BONUS_STATIONS } from "@/data/stations";
import { TYPE_COLORS } from "@/theme";

export default function MapPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Course Map
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Pins mark the {MAIN_STATIONS.length} main stations. The shaded circles are the{" "}
        {BONUS_STATIONS.length} bonus stations — somewhere in that area, not marked
        exactly. That&apos;s the hint!
      </Typography>

      {/* TODO: replace this placeholder with /public/course-map.jpg (real course image)
          once available, and set it as the background image below. */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          borderRadius: 2,
          background: "linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)",
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      >
        {BONUS_STATIONS.map((station) => (
          <Box
            key={station.id}
            sx={{
              position: "absolute",
              left: `${station.map.x}%`,
              top: `${station.map.y}%`,
              width: `${(station.map.radius ?? 10) * 2}%`,
              height: `${(station.map.radius ?? 10) * 2}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              bgcolor: TYPE_COLORS[station.type],
              opacity: 0.3,
            }}
          />
        ))}

        {STATIONS.map((station) => (
          <Tooltip key={station.id} title={`${station.name} (${station.type})`}>
            <Box
              sx={{
                position: "absolute",
                left: `${station.map.x}%`,
                top: `${station.map.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: station.isBonus ? "white" : TYPE_COLORS[station.type],
                border: station.isBonus
                  ? `3px dashed ${TYPE_COLORS[station.type]}`
                  : "2px solid white",
                boxShadow: 2,
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
