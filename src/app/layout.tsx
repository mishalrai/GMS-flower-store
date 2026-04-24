import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { existsSync } from "fs";
import { join } from "path";
import { readSingle } from "@/lib/db";
import Analytics from "@/components/Analytics";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function getIconsMetadata() {
  const settings = readSingle<Record<string, unknown>>("settings.json");
  const hasGenerated = settings?.favicon && existsSync(join(process.cwd(), "public", "generated-icons", "favicon.ico"));

  if (hasGenerated) {
    return {
      icon: [
        { url: "/generated-icons/favicon.ico", sizes: "any" },
        { url: "/generated-icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/generated-icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/generated-icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/generated-icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/generated-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    };
  }
  return undefined;
}

export const metadata: Metadata = {
  title: "GMS Flower Store - Fresh Plants from Our Garden | Gauradaha, Jhapa",
  description:
    "Buy fresh indoor & outdoor plants grown in our home garden. Money Plant, Snake Plant, Marigold, Rose & more. Free delivery in Gauradaha, Jhapa, Nepal.",
  keywords:
    "plants, flowers, indoor plants, outdoor plants, Gauradaha, Jhapa, Nepal, garden, nursery",
  icons: getIconsMetadata(),
  manifest: "/api/manifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <AuthProvider>
          <Analytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
