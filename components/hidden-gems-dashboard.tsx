"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import type { PlayerRecord, PlayerRole } from "@/data/models/player";
import { Eyebrow, PlayerCard } from "@/components/ui";

type FilterType = "all" | PlayerRole;

export function HiddenGemsDashboard({ initialPlayers }: { initialPlayers: PlayerRecord[] }) {
  const [type, setType] = useState<FilterType>("all");
  const [query, setQuery] = useState("");
  const players = useMemo(() => initialPlayers.filter(p => (type === "all" || p.identity.role === type) && p.identity.name.toLowerCase().includes(query.toLowerCase())), [initialPlayers,type,query]);
  const isLive = initialPlayers.length > 0 && initialPlayers.every(player => player.provenance.quality === "live");
  const filters: { value: FilterType; label: string }[] = [{value:"all",label:"All Players"},{value:"position-player",label:"Hitters"},{value:"pitcher",label:"Pitchers"}];
  return <div className="subpage page-width">
    <header className="page-header"><div><Eyebrow>DIAMONDDNA PLAYER INDEX</Eyebrow><h1>Hidden <em>Gems</em></h1><p>Finding the players whose production is ahead of their recognition.</p></div><div className="updated"><span>DATA SOURCE</span><strong>{isLive ? "MLB STATS API" : "MOCK FALLBACK"}</strong><small className={isLive ? "source-live" : "source-fallback"}>● {isLive ? "LIVE DATA" : "FALLBACK ACTIVE"}</small></div></header>
    <section className="method-banner"><div className="method-icon">◆</div><div><strong>Current-season player data</strong><p>Standard MLB statistics are live where verified. Advanced metrics and Gem Scores remain disabled until their source and model are validated.</p></div><button>Data notes <span>→</span></button></section>
    <div className="dashboard-bar"><div className="tabs" role="group" aria-label="Player type">{filters.map(filter=><button key={filter.value} className={type===filter.value?"active":""} onClick={()=>setType(filter.value)}>{filter.label}</button>)}</div><label className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search players..." aria-label="Search players"/></label><button className="filter-button"><Filter size={16}/> Position <SlidersHorizontal size={14}/></button></div>
    <div className="ranking-head"><span>{players.length} CURRENT-SEASON PLAYERS</span><span>GEM SCORE PLACEHOLDER · NOT RANKED</span></div>
    <div className="rankings">{players.map((player,i)=><PlayerCard player={player} rank={i+1} key={player.identity.slug}/>)}</div>
    {!players.length && <div className="empty-state">No players match those filters.</div>}
    <p className="data-note">{isLive ? "Identity and standard current-season statistics supplied by MLB Stats API. Unsupported metrics remain null and render as N/A." : "MLB data could not be loaded, so the development mock fallback is active. No fallback values should be treated as verified MLB statistics."}</p>
  </div>;
}
