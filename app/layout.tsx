import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "P89 Agent Terminal",
  description:
    "Access the classified Project 89 terminal interface. Navigate through quantum-encrypted data streams, decode reality anomalies, and explore the thin boundaries between simulation and consciousness. WARNING: Reality coherence at 89.3% - proceed with caution. [RESTRICTED ACCESS]",
  metadataBase: new URL("https://www.project89.org"),

  // Basic metadata
  applicationName: "Project 89 Terminal",
  authors: [{ name: "Project 89" }],
  generator: "Next.js",
  keywords: [
    "Project 89",
    "terminal",
    "simulation",
    "reality",
    "cyberpunk",
    "AI",
    "quantum computing",
    "consciousness",
    "reality manipulation",
    "digital anomalies",
    "experimental",
  ],

  // Icons and Favicon configuration
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph Basic
  openGraph: {
    title: "P89 Agent Terminal [RESTRICTED ACCESS]",
    description:
      "Access the classified Project 89 terminal interface. Navigate through quantum-encrypted data streams, decode reality anomalies, and explore the thin boundaries between simulation and consciousness. WARNING: Reality coherence at 89.3% - proceed with caution. [RESTRICTED ACCESS]",
    url: "https://www.project89.org",
    siteName: "Project 89",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Project 89 Terminal Interface - Reality Coherence: 89.3%",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary",
    site: "@project_89",
    title: "P89 Agent Terminal [RESTRICTED ACCESS]",
    description:
      "Access the classified Project 89 terminal interface. Navigate through quantum-encrypted data streams, decode reality anomalies, and explore the thin boundaries between simulation and consciousness. WARNING: Reality coherence at 89.3% - proceed with caution. [RESTRICTED ACCESS]",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Project 89 Terminal Interface - Reality Coherence: 89.3%",
      },
    ],
    creator: "@project_89",
  },
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
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
