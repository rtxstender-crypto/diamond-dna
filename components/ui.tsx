import Link from "next/link";
import { ArrowRight, Award, Shield, TrendingUp } from "lucide-react";
import { formatStat, type PlayerRecord } from "@/data/models/player";

export function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="eyebrow"><span/> {children}</div>; }

export function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

export function GemScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  return <div className={`gem-score ${size}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}><div><strong>{score}</strong>{size !== "sm" && <span>GEM SCORE</span>}</div></div>;
}

export function PlayerCard({ player, rank }: { player: PlayerRecord; rank?: number }) {
  const { identity, currentSeason, defense, recognition } = player;
  const isHitter = currentSeason.kind === "batting";
  const advancedLabel = isHitter ? "OPS+" : "ERA+";
  const advancedValue = isHitter ? currentSeason.opsPlus : currentSeason.eraPlus;
  return <article className="player-card">
    {rank && <div className="rank">#{String(rank).padStart(2, "0")}</div>}
    <div className="team-badge" style={{ borderColor: player.accent, color: player.accent }}>{identity.teamCode}</div>
    <div className="player-identity"><span>{identity.position} · AGE {formatStat(identity.age)}</span><h3>{identity.name}</h3><p>{identity.team} <i className={`source-pill ${player.provenance.quality === "live" ? "live" : "fallback"}`}>{player.provenance.quality === "live" ? "MLB DATA" : "MOCK FALLBACK"}</i></p></div>
    <div className="player-stats"><Stat label="WAR" value={formatStat(currentSeason.war,{decimals:1})} /><Stat label={advancedLabel} value={formatStat(advancedValue)} /><div className="trend"><TrendingUp size={14}/>{player.trend ?? "N/A"}</div></div>
    {player.gemScore === null ? <div className="score-na">N/A<span>GEM SCORE</span></div> : <GemScore score={player.gemScore}/>}
    <details className="player-details"><summary>View data profile <ArrowRight size={13}/></summary><div className="player-detail-grid">
      <section><h4>{isHitter ? "Offense" : "Pitching"}</h4>{isHitter ? <><Stat label="G / PA" value={`${formatStat(currentSeason.games)} / ${formatStat(currentSeason.plateAppearances)}`}/><Stat label="AVG / OBP / SLG" value={`${formatStat(currentSeason.battingAverage,{decimals:3})} / ${formatStat(currentSeason.onBasePercentage,{decimals:3})} / ${formatStat(currentSeason.sluggingPercentage,{decimals:3})}`}/><Stat label="HR / RBI / SB" value={`${formatStat(currentSeason.homeRuns)} / ${formatStat(currentSeason.rbi)} / ${formatStat(currentSeason.stolenBases)}`}/><Stat label="BB / K" value={`${formatStat(currentSeason.walks)} / ${formatStat(currentSeason.strikeouts)}`}/></> : <><Stat label="G / GS / IP" value={`${formatStat(currentSeason.games)} / ${formatStat(currentSeason.gamesStarted)} / ${formatStat(currentSeason.inningsPitched,{decimals:1})}`}/><Stat label="ERA / WHIP" value={`${formatStat(currentSeason.era,{decimals:2})} / ${formatStat(currentSeason.whip,{decimals:2})}`}/><Stat label="K / BB / SV" value={`${formatStat(currentSeason.strikeouts)} / ${formatStat(currentSeason.walks)} / ${formatStat(currentSeason.saves)}`}/><Stat label="WAR / FIP" value={`${formatStat(currentSeason.war,{decimals:1})} / ${formatStat(currentSeason.fip,{decimals:2})}`}/></>}</section>
      <section><h4><Shield size={13}/> Defense</h4><Stat label="POSITION / G" value={`${defense.primaryPosition ?? "N/A"} / ${formatStat(defense.games)}`}/><Stat label="INN / ERRORS" value={`${formatStat(defense.innings,{decimals:1})} / ${formatStat(defense.errors)}`}/><Stat label="FIELDING %" value={formatStat(defense.fieldingPercentage,{decimals:3})}/><Stat label="OAA / DRS" value={`${formatStat(defense.outsAboveAverage)} / ${formatStat(defense.defensiveRunsSaved)}`}/></section>
      <section><h4><Award size={13}/> Recognition</h4><Stat label="ALL-STAR / GOLD GLOVE" value={`${formatStat(recognition.allStarSelections)} / ${formatStat(recognition.goldGloves)}`}/><Stat label="SILVER SLUGGER / MVP" value={`${formatStat(recognition.silverSluggers)} / ${formatStat(recognition.mvpAwards)}`}/><Stat label="SALARY" value={formatStat(player.salary,{currency:true})}/></section>
    </div><p className="profile-provenance">Source: {player.provenance.quality === "mock-fallback" ? "Mock development fallback" : "MLB Stats API"}. Missing values are shown as N/A.</p></details>
  </article>;
}

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: React.ReactNode; text?: string; action?: { href: string; label: string } }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>{action && <Link href={action.href} className="text-link">{action.label}<ArrowRight size={16}/></Link>}</div>;
}
