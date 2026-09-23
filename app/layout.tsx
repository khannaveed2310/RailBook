import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RailBook - Train Booking",
  description: "Modern train ticket booking simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}