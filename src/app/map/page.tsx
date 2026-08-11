"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Just the course map, as-is — no pins/overlays. Tapping opens the raw image in a new
// tab so mobile browsers' native full-image viewer handles pinch-zoom reliably (more
// robust than trying to zoom an image embedded in the page, which would zoom the nav/
// text around it too).
export default function MapPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Course Map
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Tap the map to open it full-size and zoom in.
      </Typography>

      <Box
        component="a"
        href="/course-map.png"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: "block" }}
      >
        <Box
          component="img"
          src="/course-map.png"
          alt="Rush Off 5k course map"
          sx={{
            width: "100%",
            display: "block",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </Box>
    </Box>
  );
}
