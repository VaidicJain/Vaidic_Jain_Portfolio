import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaidic Jain — Portfolio",
  description:
    "Software engineer from Bhopal who loves turning fuzzy ideas into fast, thoughtful interfaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=DM+Mono:wght@400;500&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
