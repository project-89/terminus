import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "P89 Agent Terminal",
  description: "Project 89 Agent Command Line Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/BerkeleyMono-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
