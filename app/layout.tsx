import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import "./globals.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const configuredSiteUrl=process.env.DIAMONDDNA_SITE_URL;
const siteUrl=configuredSiteUrl&&URL.canParse(configuredSiteUrl)?configuredSiteUrl:"http://localhost:3000";

export const metadata: Metadata = {
  title: { default: "DiamondDNA | Baseball Intelligence", template: "%s | DiamondDNA" },
  description: "Discover overlooked MLB talent and compare career trajectories across baseball history.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "DiamondDNA | Find the value others miss.",
    description: "Modern baseball intelligence for discovering overlooked players and comparing career trajectories.",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "DiamondDNA baseball analytics" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <Navigation />
        <main>{children}</main>
        <footer className="site-footer">
          <div><span className="brand-mark small">D</span><strong>DiamondDNA</strong></div>
          <p>Built for the next generation of baseball decisions.</p>
          <span>© 2026 DiamondDNA</span>
        </footer>
      </body>
    </html>
  );
}
