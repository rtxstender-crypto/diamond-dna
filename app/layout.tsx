import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import "./globals.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const configuredSiteUrl = process.env.DIAMONDDNA_SITE_URL;
const siteUrl = configuredSiteUrl && URL.canParse(configuredSiteUrl) ? configuredSiteUrl : "http://localhost:3000";

export const metadata: Metadata = {
  title: { default: "DiamondDNA | Baseball Intelligence", template: "%s | DiamondDNA" },
  description: "Discover overlooked MLB talent and compare career trajectories across baseball history.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "DiamondDNA | See the game differently.",
    description: "Modern baseball intelligence for discovering overlooked players and comparing career trajectories.",
    images: [{ url: "/diamond-hero.png", width: 1536, height: 1024, alt: "DiamondDNA baseball intelligence" }],
  },
  twitter: { card: "summary_large_image", images: ["/diamond-hero.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head><script id="theme-init" dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem("diamonddna-theme-v1")==="dark"?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme="light"}`}} /></head>
      <body className={`${display.variable} ${body.variable}`}>
        <Navigation />
        <main>{children}</main>
        <footer className="site-footer">
          <div><span className="brand-mark small" aria-hidden="true" /><strong>Diamond<span>DNA</span></strong></div>
          <p>Built for the next generation of baseball decisions.</p>
          <span>© 2026 DiamondDNA</span>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
