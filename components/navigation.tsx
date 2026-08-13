"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/prospects", label: "Prospects" },
  { href: "/trade-simulator", label: "Trade Simulator" },
  { href: "/analysis", label: "Analysis" },
  { href: "/hidden-gems", label: "Rankings" },
  { href: "/career-trajectory", label: "Tools" },
  { href: "/methodology", label: "Methodology" },
];

export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-shell">
      <nav className="nav-wrap" aria-label="Main navigation">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" />
          <span>Diamond<span>DNA</span></span>
        </Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-navigation-links" aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <div id="main-navigation-links" className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={path === link.href ? "active" : ""} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
        <Link href="/trade-simulator" className="nav-cta">Build a trade <span>→</span></Link>
      </nav>
    </header>
  );
}
