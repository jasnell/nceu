import type { Metadata } from "next";
import "./globals.css";

const title = "NodeConf EU 2026 | Bologna, Italy";
const description =
  "NodeConf EU 2026 returns to Bologna with tickets, venue info, and conference links in one fast single-page experience.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nodeconf.eu"),
  title,
  description,
  icons: {
    icon: [
      { url: "/hexagon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/hexagon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "NodeConf EU 2026",
    url: "/",
    title,
    description,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
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
    images: ["/og.png"],
  },
};

const themeBootstrap = `(function(){try{var k='nodeconf-theme';var s=window.localStorage.getItem(k);var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
