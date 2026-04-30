import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinext Hello World",
  description: "A simple hello world app with vinext on Cloudflare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
