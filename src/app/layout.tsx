import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GMS Flower Store - Fresh Plants from Our Garden | Gauradaha, Jhapa",
  description:
    "Buy fresh indoor & outdoor plants grown in our home garden. Money Plant, Snake Plant, Marigold, Rose & more. Free delivery in Gauradaha, Jhapa, Nepal.",
  keywords:
    "plants, flowers, indoor plants, outdoor plants, Gauradaha, Jhapa, Nepal, garden, nursery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
