import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { HiddenGem } from "@/data/players";

export function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="eyebrow"><span/> {children}</div>; }

export function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

export function GemScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  return <div className={`gem-score ${size}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}><div><strong>{score}</strong>{size !== "sm" && <span>GEM SCORE</span>}</div></div>;
}

export function PlayerCard({ player, rank }: { player: HiddenGem; rank?: number }) {
  return <article className="player-card">
    {rank && <div className="rank">#{String(rank).padStart(2, "0")}</div>}
    <div className="team-badge" style={{ borderColor: player.accent, color: player.accent }}>{player.teamCode}</div>
    <div className="player-identity"><span>{player.position} · AGE {player.age}</span><h3>{player.name}</h3><p>{player.team}</p></div>
    <div className="player-stats"><Stat label="WAR" value={player.war.toFixed(1)} /><Stat label={player.advancedLabel} value={player.advancedValue} /><div className="trend"><TrendingUp size={14}/>{player.trend}</div></div>
    <GemScore score={player.gemScore}/>
  </article>;
}

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: React.ReactNode; text?: string; action?: { href: string; label: string } }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>{action && <Link href={action.href} className="text-link">{action.label}<ArrowRight size={16}/></Link>}</div>;
}
