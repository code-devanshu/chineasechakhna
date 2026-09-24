import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Newsreader, Patrick_Hand } from "next/font/google";
import { cafe } from "@/lib/content";
import "./globals.css";

// Bricolage Grotesque's width axis is what lets the giant words widen and narrow as you scroll.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const script = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: cafe.fullName,
  description: cafe.description,
  openGraph: {
    title: cafe.fullName,
    description: cafe.description,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/story/lanterns.jpg", width: 1200, height: 1500, alt: "Chinese Chakhna" }],
  },
  twitter: { card: "summary_large_image", title: cafe.fullName, description: cafe.description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: cafe.hero.look.bg,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
