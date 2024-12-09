import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dailo",
  description: "Interactive AI-Powered Podcast Learning Experience.",
  applicationName: "Dailo",
  appleWebApp: {
    title: "Dailo",
    statusBarStyle: "default",
    capable: true,
  },
  openGraph: {
    title: "Dailo",
    description: "Interactive AI-Powered Podcast Learning Experience.",
    images: [
      {
        url: "/images/og/dailo_og.png",
        width: 1200,
        height: 630,
        alt: "Dailo - Interactive AI-Powered Podcasts",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dailo",
    description: "Interactive AI-Powered Podcast Learning Experience.",
    images: ["/images/og/dailo_og.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon/favicon.ico", sizes: "any" },
      { url: "/images/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/images/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon/favicon.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/images/favicon/favicon.ico",
    apple: [
      { url: "/images/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/images/favicon/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/images/favicon/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/images/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
