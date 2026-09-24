import type { Metadata, Viewport } from "next";
import AttendeeApp from "./attendee-app";

// The installable attendee app: a phone-sized program with now/next, starred
// talks and offline support (public/sw.js). The manifest is only linked from
// here, so installing always opens straight into /app.
export const metadata: Metadata = {
  title: "NodeConf EU 2026 · Program",
  description:
    "The NodeConf EU 2026 program in your pocket: what's on now, what's next, and your starred talks. Works offline.",
  manifest: "/app.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NodeConf EU",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/hexagon.svg", type: "image/svg+xml" },
      { url: "/app-icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/app-icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ecdc" },
    { media: "(prefers-color-scheme: dark)", color: "#14110c" },
  ],
};

export default function AppPage() {
  return <AttendeeApp />;
}
