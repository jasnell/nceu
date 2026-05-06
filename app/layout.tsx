import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeConf EU 2026 | Bologna, Italy",
  description:
    "NodeConf EU 2026 returns to Bologna with tickets, CFP, venue info, and conference links in one fast single-page experience.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
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
