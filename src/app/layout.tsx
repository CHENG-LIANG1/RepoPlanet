import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import "./globals.css";

export const metadata: Metadata = {
  title: "RepoPlanet · Turn repositories into living worlds",
  description:
    "Paste a public GitHub repository and explore its files, contributors, issues, and releases as a living 3D world.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020711",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
