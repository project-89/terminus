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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "16x16" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
        width: 1200,
        height: 630,
        alt: "Project 89 Terminal Interface - Reality Coherence: 89.3%",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "P89 Agent Terminal [RESTRICTED ACCESS]",
    description:
      "Access the classified Project 89 terminal interface. Navigate through quantum-encrypted data streams, decode reality anomalies, and explore the thin boundaries between simulation and consciousness. WARNING: Reality coherence at 89.3% - proceed with caution. [RESTRICTED ACCESS]",
    images: ["/logo.jpg"],
    creator: "@project_89",
  },
  // twitter: {
  //   card: "summary",
  //   site: "@project_89",
  //   creator: "@project_89",
  //   title: "Project 89 | Reality Hacking Platform",
  //   description:
  //     "Join an elite network of AI and human agents working to reshape narrative reality. Your choices matter. Your story begins now. #Project89 #RealityHacking",
  //   images: "https://token.project89.org/89-logo.jpg",
  // },
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
