import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoundScope",
  description: "",
};

import { IBM_Plex_Mono } from "next/font/google";

const plexMono = IBM_Plex_Mono({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={plexMono.className}
      >
        {children}
      </body>
    </html>
  );
}
