import type { NextConfig } from "vinext";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Sponsor and partner logos load from third-party CDNs; allow any HTTPS host.
  "img-src 'self' data: blob: https:",
  // The attendee app's service worker (public/sw.js) fetches Google Fonts so
  // /app keeps its typography offline.
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Content-Security-Policy", value: CSP },
];

// The 2026 edition moved under /2026 when the site switched to 2027. These
// keep old links, calendar subscriptions and the installed attendee app
// working. They are temporary (307) so the paths can be reused by 2027.
const archived2026 = [
  "/program",
  "/program.json",
  "/program.ics",
  "/speakers",
  "/photos",
  "/photos/:path*",
  "/app",
  "/app.webmanifest",
  "/app-icons/:path*",
  "/speakers/:path*",
];

const config: NextConfig = {
  async redirects() {
    return archived2026.map((source) => ({
      source,
      destination: `/2026${source}`,
      permanent: false,
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
