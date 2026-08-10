"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, ChevronDown, Filter, Info, Search, Sparkles, UserRoundSearch } from "lucide-react";
import { buildCurrentPlayerSeasons, findSeasonComparisons, formatSeasonMetric, type HistoricalYearFilter, type MetricComparison } from "@/data/trajectory-comparison";
import { trajectoryPlayers, type TrajectoryPlayer, type TrajectoryRole } from "@/data/trajectory";
import { Eyebrow, Stat } from "@/components/ui";
import { TrajectoryChart } from "@/components/trajectory-chart";

type RoleFilter = "all" | TrajectoryRole;
type AgeFilter = "all" | "under-25" | "25-29" | "30-plus";

function initials(name: string) { return name.split(" ").map(part => part[0]).join("").replace(".", "").slice(0, 3); }
function closenessLabel(metric: MetricComparison) { return metric.closeness === "very-close" ? "Very Close" : metric.closeness === "close" ? "Close" : "Different"; }

export function TrajectoryExplorer() {
  const [selectedId, setSelectedId] = useState(trajectoryPlayers[0].id);
  const [selectedSeason, setSelectedSeason] = useState(2026);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [position, setPosition] = useState("all");
  const [age, setAge] = useState<AgeFilter>("all");
  const [historicalFilter, setHistoricalFilter] = useState<HistoricalYearFilter>("all");
  const [specificYear, setSpecificYear] = useState("2000");
  const player = trajectoryPlayers.find(candidate => candidate.id === selectedId) ?? trajectoryPlayers[0];
  const seasons = useMemo(()=>buildCurrentPlayerSeasons(player),[player]);
  const season = seasons.find(candidate=>candidate.season===selectedSeason) ?? seasons.at(-1)!;
  const comparisons = useMemo(()=>findSeasonComparisons(season,historicalFilter,Number(specificYear),3),[season,historicalFilter,specificYear]);
  const positions = useMemo(() => Array.from(new Set(trajectoryPlayers.map(candidate => candidate.position))).sort(), []);
  const filteredPlayers = useMemo(() => trajectoryPlayers.filter(candidate => {
    const matchesSearch = `${candidate.name} ${candidate.team}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = role === "all" || candidate.role === role;
    const matchesPosition = position === "all" || candidate.position === position;
    const matchesAge = age === "all" || (age === "under-25" && candidate.age < 25) || (age === "25-29" && candidate.age >= 25 && candidate.age <= 29) || (age === "30-plus" && candidate.age >= 30);
    return matchesSearch && matchesRole && matchesPosition && matchesAge;
  }), [query, role, position, age]);

  function choosePlayer(candidate: TrajectoryPlayer) {
    setSelectedId(candidate.id);
    setSelectedSeason(buildCurrentPlayerSeasons(candidate).at(-1)!.season);
  }

  return <>
    <section className="trajectory-demo-banner"><Info size={17}/><div><strong>Demo trajectory dataset</strong><p>Every season stat, historical match, chart curve, and Similarity Score on this page is mock interface data—not live MLB Stats API data or a forecast.</p></div><span>DEMO DATA</span></section>
    <section className="trajectory-picker">
      <div className="picker-controls">
        <div className="picker-heading"><UserRoundSearch/><div><span>PLAYER EXPLORER</span><strong>Choose a current player</strong></div></div>
        <label className="trajectory-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search player or team..." aria-label="Search current players"/></label>
        <div className="trajectory-filters"><span><Filter/> FILTERS</span><select value={role} onChange={event=>setRole(event.target.value as RoleFilter)} aria-label="Filter by player type"><option value="all">All players</option><option value="hitter">Hitters</option><option value="pitcher">Pitchers</option></select><select value={position} onChange={event=>setPosition(event.target.value)} aria-label="Filter by position"><option value="all">All positions</option>{positions.map(value=><option value={value} key={value}>{value}</option>)}</select><select value={age} onChange={event=>setAge(event.target.value as AgeFilter)} aria-label="Filter by age"><option value="all">All ages</option><option value="under-25">Under 25</option><option value="25-29">Age 25–29</option><option value="30-plus">Age 30+</option></select></div>
      </div>
      <div className="player-result-head"><span>{filteredPlayers.length} OF {trajectoryPlayers.length} PLAYERS</span><button onClick={()=>{setQuery("");setRole("all");setPosition("all");setAge("all")}}>Clear filters</button></div>
      <div className="trajectory-player-list">{filteredPlayers.map(candidate=><button key={candidate.id} className={candidate.id===selectedId?"active":""} onClick={()=>choosePlayer(candidate)}><span className="picker-monogram">{initials(candidate.name)}</span><span><strong>{candidate.name}</strong><small>{candidate.position} · {candidate.team}</small></span><i>{candidate.role === "hitter" ? "H" : "P"}</i></button>)}</div>
      {!filteredPlayers.length&&<div className="trajectory-empty">No players match those filters.</div>}
    </section>

    <section className="season-control-panel">
      <div className="season-current"><div className="profile-monogram">{initials(player.name)}</div><div><span>SELECTED DEMO PROFILE</span><h2>{player.name}</h2><p>{player.position} · {player.team} · AGE {season.age}</p></div></div>
      <label><span>CURRENT PLAYER SEASON</span><div><select value={season.season} onChange={event=>setSelectedSeason(Number(event.target.value))}>{[...seasons].reverse().map(option=><option value={option.season} key={option.season}>{option.season} {player.name}</option>)}</select><ChevronDown/></div></label>
      <label><span>HISTORICAL SEARCH RANGE</span><div><select value={historicalFilter} onChange={event=>setHistoricalFilter(event.target.value as HistoricalYearFilter)}><option value="all">All Years</option><option value="2020s">2020s</option><option value="2010s">2010s</option><option value="2000s">2000s</option><option value="1990s">1990s</option><option value="1980s">1980s</option><option value="earlier">Earlier</option><option value="specific">Specific Year</option></select><ChevronDown/></div></label>
      {historicalFilter==="specific"&&<label><span>SPECIFIC YEAR</span><input className="specific-year" type="number" min="1900" max="2026" value={specificYear} onChange={event=>setSpecificYear(event.target.value)} /></label>}
      <Stat label="DEMO SEASON WAR" value={season.war?.toFixed(1)??"N/A"}/>
    </section>

    <TrajectoryChart player={player} comparisons={comparisons.map(comparison=>comparison.historicalCareer)} selectedPoints={[{name:player.name,age:season.age,season:season.season},...comparisons.map(comparison=>({name:comparison.historicalSeason.playerName,age:comparison.historicalSeason.age,season:comparison.historicalSeason.season}))]}/>
    <div className="comparison-heading"><div><Eyebrow>MOCK SEASON MATCHES</Eyebrow><h2>Statistical evidence, <em>side by side</em></h2></div><span><Sparkles size={15}/> {comparisons.length} DEMO MATCHES</span></div>
    {comparisons.length ? <div className="season-match-list">{comparisons.map((comparison,index)=><article className="season-comparison-card" key={`${comparison.historicalSeason.playerId}-${comparison.historicalSeason.season}`}>
      <div className="season-match-head"><div className="match-rank">0{index+1}</div><div className="historic-monogram" style={{color:comparison.historicalCareer.color}}>{initials(comparison.historicalSeason.playerName)}</div><div><span>{comparison.historicalSeason.position} · {comparison.historicalCareer.era} · DEMO DATA</span><h3>{comparison.historicalSeason.playerName}</h3></div><div className="match-score"><strong>{comparison.similarityScore}%</strong><span>MOCK SIMILARITY</span></div></div>
      <div className="season-pair"><strong>{comparison.currentSeason.season} {comparison.currentSeason.playerName}</strong><ArrowLeftRight/><strong>{comparison.historicalSeason.season} {comparison.historicalSeason.playerName}</strong></div>
      <p className="comparison-summary">{comparison.summary}</p>
      <details className="why-similar" open={index===0}><summary>Why They&apos;re Similar <ChevronDown/></summary><div className="evidence-layout">
        <div className="metric-evidence"><div className="metric-evidence-head"><span>METRIC</span><span>{comparison.currentSeason.season} CURRENT</span><span>{comparison.historicalSeason.season} HISTORICAL</span><span>EVIDENCE</span></div>{comparison.metrics.map(metric=><div className="metric-evidence-row" key={metric.key}><strong>{metric.label}</strong><span>{formatSeasonMetric(metric,metric.currentValue)}</span><span>{formatSeasonMetric(metric,metric.historicalValue)}</span><i className={metric.closeness}>{closenessLabel(metric)}</i></div>)}</div>
        <aside><div><span>STRONGEST SIMILARITIES</span>{comparison.strongestSimilarities.map(metric=><strong className="positive" key={metric.key}>{metric.label}</strong>)}</div><div><span>BIGGEST DIFFERENCES</span>{comparison.biggestDifferences.map(metric=><strong className="negative" key={metric.key}>{metric.label}</strong>)}</div><p><b>Comparison Summary</b>{comparison.summary}</p></aside>
      </div></details>
    </article>)}</div>:<div className="trajectory-empty wide">No demo historical seasons are available for this year filter. Try another range.</div>}
    <div className="disclaimer"><Info/><p><strong>Season similarity is not a career prediction.</strong> The marked historical season only shows where stored season metrics are close. Career paths before and after the matched point are context—not a forecast for the current player.</p></div>
  </>;
}
