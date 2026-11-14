import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SkillSwap — Trade skills. Grow together.",
  description:
    "Share what you know. Learn what you love. A peer-to-peer skill exchange platform by Earhl Dumaquita.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
