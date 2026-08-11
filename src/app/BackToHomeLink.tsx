import Link from "next/link";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// QR-landed pages (/start, /station/*, /finish) hide the bottom nav on purpose — they're
// single-purpose flows, not everyday navigation. But that leaves no way back into the
// app if the phone's browser/QR-scanner view has no visible back button, so each of
// those pages includes this small link instead of restoring the full nav bar.
export default function BackToHomeLink() {
  return (
    <Box sx={{ p: 2 }}>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: "0.875rem",
          color: "inherit",
          opacity: 0.7,
        }}
      >
        <ArrowBackIcon fontSize="small" /> Back to Home
      </Link>
    </Box>
  );
}
