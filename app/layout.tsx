import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project 89 - Coming Soon",
  description: "Project 89 - A quantum reality exploration. Coming soon.",
  metadataBase: new URL("https://www.project89.org"),

  // Basic metadata
  applicationName: "Project 89",
  authors: [{ name: "Project 89" }],
  generator: "Next.js",
  keywords: [
    "Project 89",
    "trailer",
    "coming soon",
    "quantum",
    "reality",
    "cyberpunk",
    "AI",
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
    title: "Project 89 - Coming Soon",
    description: "Project 89 - A quantum reality exploration. Coming soon.",
    url: "https://www.project89.org",
    siteName: "Project 89",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Project 89 - Coming Soon",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary",
    site: "@project_89",
    title: "Project 89 - Coming Soon",
    description: "Project 89 - A quantum reality exploration. Coming soon.",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Project 89 - Coming Soon",
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
    <html lang="en" className="overflow-hidden m-0 p-0">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="preload"
          href="/BerkeleyMono-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="overflow-hidden m-0 p-0">{children}</body>
    </html>
  );
}
