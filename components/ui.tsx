import Link from "next/link";
import { ArrowRight, Award, Shield } from "lucide-react";
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
  const details = player.gemScoreDetails;
  return <article className="player-card">
    {rank && <div className="rank">#{String(rank).padStart(2, "0")}</div>}
    <div className="team-badge" style={{ borderColor: player.accent, color: player.accent }}>{identity.teamCode}</div>
    <div className="player-identity"><span>{identity.position} · AGE {formatStat(identity.age)}</span><h3>{identity.name}</h3><p>{identity.team} <i className={`source-pill ${player.provenance.quality === "live" ? "live" : "fallback"}`}>{player.provenance.quality === "live" ? "MLB DATA" : "MOCK FALLBACK"}</i></p></div>
    <div className="player-stats">{isHitter ? <><Stat label="OPS" value={formatStat(currentSeason.ops,{decimals:3})}/><Stat label="OBP" value={formatStat(currentSeason.onBasePercentage,{decimals:3})}/><Stat label="PA" value={formatStat(currentSeason.plateAppearances)}/></> : <><Stat label="ERA" value={formatStat(currentSeason.era,{decimals:2})}/><Stat label="WHIP" value={formatStat(currentSeason.whip,{decimals:2})}/><Stat label={details?.roleGroup === "reliever" ? "G" : "IP"} value={details?.roleGroup === "reliever" ? formatStat(currentSeason.games) : formatStat(currentSeason.inningsPitched,{decimals:1})}/></>}</div>
    {player.gemScore === null ? <div className="score-na">N/A<span>GEM SCORE</span></div> : <GemScore score={player.gemScore}/>}
    <details className="player-details"><summary>Why this Gem Score? <ArrowRight size={13}/></summary>{details && <div className="gem-explanation"><div className="gem-category-grid">{details.categories.map(category=><Stat key={category.key} label={category.label.toUpperCase()} value={category.score===null?"N/A":Math.round(category.score)} note={category.activeWeight===null?"Not active in v1":`${category.activeWeight.toFixed(0)}% active weight`}/>)}</div><div className="gem-reasons"><section><h4>Why he ranks highly</h4>{details.positiveFactors.length?details.positiveFactors.map(item=><p key={item.metric}>+ {item.description}</p>):<p>No above-median inputs available.</p>}</section><section><h4>What lowers the score</h4>{details.limitingFactors.length?details.limitingFactors.map(item=><p key={item.metric}>− {item.description}</p>):<p>No below-median inputs among available metrics.</p>}</section></div><p className="gem-sample"><strong>{details.sampleStatus}</strong> · {details.metricsUsed} performance metrics · {details.roleGroup} pool · Source: {details.source}</p></div>}<div className="player-detail-grid">
      <section><h4>{isHitter ? "Offense" : "Pitching"}</h4>{isHitter ? <><Stat label="G / PA" value={`${formatStat(currentSeason.games)} / ${formatStat(currentSeason.plateAppearances)}`}/><Stat label="AVG / OBP / SLG" value={`${formatStat(currentSeason.battingAverage,{decimals:3})} / ${formatStat(currentSeason.onBasePercentage,{decimals:3})} / ${formatStat(currentSeason.sluggingPercentage,{decimals:3})}`}/><Stat label="HR / RBI / SB" value={`${formatStat(currentSeason.homeRuns)} / ${formatStat(currentSeason.rbi)} / ${formatStat(currentSeason.stolenBases)}`}/><Stat label="BB / K" value={`${formatStat(currentSeason.walks)} / ${formatStat(currentSeason.strikeouts)}`}/></> : <><Stat label="G / GS / IP" value={`${formatStat(currentSeason.games)} / ${formatStat(currentSeason.gamesStarted)} / ${formatStat(currentSeason.inningsPitched,{decimals:1})}`}/><Stat label="ERA / WHIP" value={`${formatStat(currentSeason.era,{decimals:2})} / ${formatStat(currentSeason.whip,{decimals:2})}`}/><Stat label="K / BB / SV" value={`${formatStat(currentSeason.strikeouts)} / ${formatStat(currentSeason.walks)} / ${formatStat(currentSeason.saves)}`}/><Stat label="WAR / FIP" value={`${formatStat(currentSeason.war,{decimals:1})} / ${formatStat(currentSeason.fip,{decimals:2})}`}/></>}</section>
      <section><h4><Shield size={13}/> Defense</h4><Stat label="POSITION / G" value={`${defense.primaryPosition ?? "N/A"} / ${formatStat(defense.games)}`}/><Stat label="INN / ERRORS" value={`${formatStat(defense.innings,{decimals:1})} / ${formatStat(defense.errors)}`}/><Stat label="FIELDING %" value={formatStat(defense.fieldingPercentage,{decimals:3})}/><Stat label="OAA / DRS" value={`${formatStat(defense.outsAboveAverage)} / ${formatStat(defense.defensiveRunsSaved)}`}/></section>
      <section><h4><Award size={13}/> Recognition</h4><Stat label="ALL-STAR / GOLD GLOVE" value={`${formatStat(recognition.allStarSelections)} / ${formatStat(recognition.goldGloves)}`}/><Stat label="SILVER SLUGGER / MVP" value={`${formatStat(recognition.silverSluggers)} / ${formatStat(recognition.mvpAwards)}`}/><Stat label="SALARY" value={formatStat(player.salary,{currency:true})}/></section>
    </div><p className="profile-provenance">Source: {player.provenance.quality === "mock-fallback" ? "Mock development fallback" : "MLB Stats API"}. Missing values are shown as N/A.</p></details>
  </article>;
}

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: React.ReactNode; text?: string; action?: { href: string; label: string } }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>{action && <Link href={action.href} className="text-link">{action.label}<ArrowRight size={16}/></Link>}</div>;
}
