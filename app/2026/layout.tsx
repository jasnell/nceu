import type { Metadata } from "next";

// The archived 2026 edition. Pages under /2026 inherit this metadata; the
// attendee app (/2026/app) sets its own.
const title = "NodeConf EU 2026 | Bologna, Italy";
const description =
  "NodeConf EU 2026 in Bologna: the program, speakers, photos, and every talk on YouTube.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "NodeConf EU 2026",
    url: "/2026",
    title,
    description,
    locale: "en_US",
    images: [
      {
        url: "/2026/og.png",
        width: 1200,
        height: 621,
        type: "image/png",
        alt: "NodeConf EU 2026 — a sharper, warmer Node.js gathering for Europe. 29-30 September, Bologna, Italy, Hotel Savoia Regency.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/2026/og.png"],
  },
};

export default function Edition2026Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
