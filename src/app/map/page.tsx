"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { MAIN_STATIONS, SECRET_STATIONS } from "@/data/stations";
import { CLUE_COLORS } from "@/theme";

export default function MapPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Course Map
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Pins mark the {MAIN_STATIONS.length} main clues. The shaded circles are the{" "}
        {SECRET_STATIONS.length} extra-secret clues — somewhere in that area, not
        marked exactly. That&apos;s the hint! Since it&apos;s a there-and-back course,
        you&apos;ll pass every pin twice — a good chance to mop up anything missed on
        the way out.
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
        {SECRET_STATIONS.map((station) => (
          <Box
            key={station.id}
            sx={{
              position: "absolute",
              left: `${station.map.x}%`,
              top: `${station.map.y}%`,
              width: `${(station.map.radius ?? 8) * 2}%`,
              height: `${(station.map.radius ?? 8) * 2}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              bgcolor: CLUE_COLORS.secret,
              opacity: 0.35,
            }}
          />
        ))}

        {MAIN_STATIONS.map((station) => (
          <Tooltip key={station.id} title={`Clue #${station.id}`}>
            <Box
              sx={{
                position: "absolute",
                left: `${station.map.x}%`,
                top: `${station.map.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: CLUE_COLORS.main,
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
