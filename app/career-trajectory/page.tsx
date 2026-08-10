"use client";

import { useState } from "react";
import { ChevronDown, Info, Sparkles } from "lucide-react";
import { currentPlayers, historicalMatches } from "@/data/players";
import { Eyebrow, Stat } from "@/components/ui";
import { TrajectoryChart } from "@/components/trajectory-chart";

export default function CareerTrajectoryPage() {
  const [id,setId] = useState(currentPlayers[0].id);
  const player = currentPlayers.find(p=>p.id===id) ?? currentPlayers[0];
  return <div className="subpage page-width trajectory-page">
    <header className="page-header trajectory-title"><div><Eyebrow>CAREER DNA ANALYSIS</Eyebrow><h1>Career <em>Trajectory</em></h1><p>Connect today&apos;s performance curve to the careers that came before.</p></div></header>
    <section className="player-selector"><div><span>SELECT A CURRENT PLAYER</span><label><select value={id} onChange={e=>setId(e.target.value)}>{currentPlayers.map(p=><option value={p.id} key={p.id}>{p.name} — {p.team}</option>)}</select><ChevronDown/></label></div><div className="selected-profile"><div className="profile-monogram">{player.name.split(" ").map(n=>n[0]).join("").replace(".","")}</div><div><span>CURRENT PROFILE</span><h2>{player.name}</h2><p>{player.position} · {player.team} · AGE {player.age}</p></div><Stat label="CAREER WAR" value={player.war.toFixed(1)}/></div></section>
    <TrajectoryChart player={player} comparisons={historicalMatches}/>
    <div className="comparison-heading"><div><Eyebrow>HISTORICAL MATCHES</Eyebrow><h2>Careers with the closest <em>DNA</em></h2></div><span><Sparkles size={15}/> TOP 3 MATCHES</span></div>
    <div className="match-grid">{historicalMatches.map((match,i)=><article className="comparison-card" key={match.name}><div className="match-rank">0{i+1}</div><div className="match-score"><strong>{match.score}%</strong><span>SIMILARITY</span></div><div className="historic-monogram" style={{color:match.color}}>{match.name.split(" ").map(n=>n[0]).join("")}</div><span>{match.position} · {match.era}</span><h3>{match.name}</h3><div className="similarity-bar"><i style={{width:`${match.score}%`,background:match.color}}/></div><p>Similar early-career value accumulation, age curve, and year-over-year development pattern.</p></article>)}</div>
    <div className="disclaimer"><Info/><p><strong>Similarity is context, not a forecast.</strong> A high match means the shape of two statistical careers is similar through the selected age. It does not predict future performance, health, or career outcomes.</p></div>
  </div>;
}
