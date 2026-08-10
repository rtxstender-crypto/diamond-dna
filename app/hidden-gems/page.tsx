"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { hiddenGems, type PlayerType } from "@/data/players";
import { Eyebrow, PlayerCard } from "@/components/ui";

type FilterType = "All" | PlayerType;

export default function HiddenGemsPage() {
  const [type, setType] = useState<FilterType>("All");
  const [query, setQuery] = useState("");
  const players = useMemo(() => hiddenGems.filter(p => (type === "All" || p.type === type) && p.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.gemScore-a.gemScore), [type,query]);
  return <div className="subpage page-width">
    <header className="page-header"><div><Eyebrow>DIAMONDDNA PLAYER INDEX</Eyebrow><h1>Hidden <em>Gems</em></h1><p>Finding the players whose production is ahead of their recognition.</p></div><div className="updated"><span>LAST UPDATED</span><strong>AUG 09, 2026</strong><small>● LIVE MODEL</small></div></header>
    <section className="method-banner"><div className="method-icon">◆</div><div><strong>How the Gem Score works</strong><p>A composite signal combining production, age, opportunity, and market attention. Scores are illustrative while our model is in development.</p></div><button>Methodology <span>→</span></button></section>
    <div className="dashboard-bar"><div className="tabs" role="group" aria-label="Player type">{(["All","Hitter","Pitcher"] as FilterType[]).map(t=><button key={t} className={type===t?"active":""} onClick={()=>setType(t)}>{t === "All" ? "All Players" : `${t}s`}</button>)}</div><label className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search players..." aria-label="Search players"/></label><button className="filter-button"><Filter size={16}/> Position <SlidersHorizontal size={14}/></button></div>
    <div className="ranking-head"><span>{players.length} QUALIFYING PLAYERS</span><span>RANKED BY GEM SCORE ↓</span></div>
    <div className="rankings">{players.map((player,i)=><PlayerCard player={player} rank={i+1} key={player.id}/>)}</div>
    {!players.length && <div className="empty-state">No players match those filters.</div>}
    <p className="data-note">Mock data for product demonstration. Player statistics and Gem Scores are illustrative and are not sourced from a live MLB data provider.</p>
  </div>;
}
