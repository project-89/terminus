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
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Project 89 - A quantum reality exploration",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@project_89",
    title: "Project 89 - Coming Soon",
    description: "Project 89 - A quantum reality exploration. Coming soon.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Project 89 - A quantum reality exploration",
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
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link
          rel="preload"
          href="/BerkeleyMono-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#090812]" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
