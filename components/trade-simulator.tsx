"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Check, ChevronDown, Search, Trash2 } from "lucide-react";
import type { TradeAssetInput, TradeEvaluation, TradeSideInput, TradeValueResult } from "@/data/trade-value/types";
import type { TradeTeam } from "@/data/trade-value/teams";
import type { GeneratedTradePackage } from "@/data/trade-builder/types";

type Candidate = { input: TradeAssetInput; value: TradeValueResult };

function TeamSelect({ label, team, teams, onChange }: { label: string; team: TradeTeam; teams: TradeTeam[]; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = teams.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  return (
    <div className={`team-select ${open ? "open" : ""}`} ref={rootRef}>
      <button type="button" className="team-select-trigger" aria-label={`Choose ${label}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => { if (!open) setQuery(""); setOpen((value) => !value); }}>
        <span><small>{team.abbreviation}</small><strong>{team.name}</strong></span>
        <ChevronDown />
      </button>
      {open && (
        <div className="team-select-menu">
          <label className="team-select-search">
            <Search />
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search MLB teams" aria-label="Search MLB teams" />
          </label>
          <div className="team-select-options" role="listbox" aria-label={label}>
            {filtered.map((item) => (
              <button key={item.id} type="button" role="option" aria-selected={item.id === team.id} className={item.id === team.id ? "selected" : ""} onClick={() => { onChange(item.id); setQuery(""); setOpen(false); }}>
                <span className="team-option-mark">{item.abbreviation}</span>
                <span><strong>{item.name}</strong><small>MLB team</small></span>
                {item.id === team.id && <Check />}
              </button>
            ))}
            {!filtered.length && <p>No teams found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerSearch({ team, excluded, onAdd }: { team: TradeTeam; excluded: Set<string>; onAdd: (candidate: Candidate) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/trades/search?teamId=${team.id}&q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await response.json() as { players?: Candidate[] };
        setResults(data.players ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, team.id]);
  return <div className="trade-search"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${team.abbreviation} MLB / MiLB players`} aria-label={`Search ${team.name} players`} /></label>{query.trim().length >= 2 && (results.length > 0 || loading) && <div className="trade-search-results">{loading && <p>Searching verified data…</p>}{results.filter((item) => !excluded.has(`${item.input.kind}:${item.input.id}`)).map((item) => <button key={`${item.input.kind}:${item.input.id}`} onClick={() => { onAdd(item); setQuery(""); setResults([]); }}><span><strong>{item.input.name}</strong><small>{item.input.kind === "prospect" ? `${item.input.level} · Statistical prospect value` : `${item.input.position} · ${item.input.role}`}</small></span><b>{item.value.value}</b></button>)}</div>}</div>;
}

function ValueDetail({ value }: { value: TradeValueResult }) {
  return <details className="trade-value-detail"><summary>Why this Trade Value?</summary><div>{value.components.map((item) => <p key={item.key}><span>{item.label} <small>{item.weight}%</small></span><strong>{item.score === null ? "N/A" : item.score}</strong><em>{item.note}</em></p>)}</div></details>;
}

function TradeColumn({ label, team, teams, setTeam, assets, remove, add, excluded }: { label: string; team: TradeTeam; teams: TradeTeam[]; setTeam: (id: number) => void; assets: Candidate[]; remove: (id: string) => void; add: (candidate: Candidate) => void; excluded: Set<string> }) {
  const total = assets.reduce((sum, item) => sum + item.value.value, 0);
  return <section className="trade-column"><header><span>{label}</span><TeamSelect label={label} team={team} teams={teams} onChange={setTeam} /></header><PlayerSearch team={team} excluded={excluded} onAdd={add} /><div className="trade-assets">{assets.map((item) => <article key={`${item.input.kind}:${item.input.id}`}><div className="trade-player-head"><span><strong>{item.input.name}</strong><small>{item.input.position} · {item.input.kind === "prospect" ? item.input.level : item.input.role}</small></span><b>{item.value.value}<small> / {item.value.maximumAvailable}</small></b><button onClick={() => remove(`${item.input.kind}:${item.input.id}`)} aria-label={`Remove ${item.input.name}`}><Trash2 /></button></div>{item.value.provisional && <p className="provisional">Provisional value · verified inputs missing</p>}<ValueDetail value={item.value} /></article>)}{!assets.length && <div className="trade-empty">Search and add up to eight players.</div>}</div><footer><span>Raw package value</span><strong>{Math.round(total * 10) / 10}</strong></footer></section>;
}

export function TradeSimulator({ teams }: { teams: TradeTeam[] }) {
  const [aId, setAId] = useState(teams[0].id);
  const [bId, setBId] = useState(teams[1].id);
  const [aAssets, setAAssets] = useState<Candidate[]>([]);
  const [bAssets, setBAssets] = useState<Candidate[]>([]);
  const [result, setResult] = useState<TradeEvaluation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const aTeam = teams.find((team) => team.id === aId)!;
  const bTeam = teams.find((team) => team.id === bId)!;
  const excluded = useMemo(() => new Set([...aAssets, ...bAssets].map((item) => `${item.input.kind}:${item.input.id}`)), [aAssets, bAssets]);

  useEffect(() => {
    function load(event:Event){const pkg=(event as CustomEvent<GeneratedTradePackage>).detail;if(!pkg)return;setAId(pkg.teamA.teamId);setBId(pkg.teamB.teamId);setAAssets(pkg.teamA.assets.map((input,index)=>({input,value:pkg.valuesA[index]})));setBAssets(pkg.teamB.assets.map((input,index)=>({input,value:pkg.valuesB[index]})));setResult(pkg.evaluation);setError("");document.querySelector(".trade-builder")?.scrollIntoView({behavior:"smooth",block:"start"})}
    document.addEventListener("diamonddna:load-trade",load);return()=>document.removeEventListener("diamonddna:load-trade",load);
  },[]);

  function changeTeam(side: "a" | "b", id: number) {
    if (side === "a") {
      setAId(id); setAAssets([]);
      if (id === bId) { const next = teams.find((team) => team.id !== id)!; setBId(next.id); setBAssets([]); }
    } else {
      setBId(id); setBAssets([]);
      if (id === aId) { const next = teams.find((team) => team.id !== id)!; setAId(next.id); setAAssets([]); }
    }
    setResult(null);
  }

  async function evaluate() {
    setError(""); setLoading(true);
    const body: { teamA: TradeSideInput; teamB: TradeSideInput } = { teamA: { teamId: aId, team: aTeam.name, assets: aAssets.map((item) => item.input) }, teamB: { teamId: bId, team: bTeam.name, assets: bAssets.map((item) => item.input) } };
    try {
      const response = await fetch("/api/trades/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Evaluation failed.");
      setResult(data as TradeEvaluation);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Evaluation failed.");
    } finally { setLoading(false); }
  }

  return <><div className="trade-beta-note"><strong>TRADE VALUE V1 BETA</strong><span>Contract and team-control inputs remain unscored until a verified provider is connected. Team competitive context is neutral.</span></div><div className="trade-builder"><TradeColumn label="TEAM A SENDS" team={aTeam} teams={teams} setTeam={(id) => changeTeam("a", id)} assets={aAssets} remove={(id) => setAAssets((items) => items.filter((item) => `${item.input.kind}:${item.input.id}` !== id))} add={(item) => aAssets.length < 8 && setAAssets((items) => [...items, item])} excluded={excluded} /><div className="trade-swap"><ArrowLeftRight /></div><TradeColumn label="TEAM B SENDS" team={bTeam} teams={teams} setTeam={(id) => changeTeam("b", id)} assets={bAssets} remove={(id) => setBAssets((items) => items.filter((item) => `${item.input.kind}:${item.input.id}` !== id))} add={(item) => bAssets.length < 8 && setBAssets((items) => [...items, item])} excluded={excluded} /></div><button className="trade-evaluate" disabled={loading || !aAssets.length || !bAssets.length} onClick={evaluate}>{loading ? "Evaluating…" : "Evaluate Trade"}</button>{error && <p className="trade-error">{error}</p>}{result && <section className="trade-verdict"><span>TRADE VERDICT</span><h2>{result.verdict}</h2><div className="verdict-values"><article><small>{result.teamA.team} receives</small><strong>{result.teamA.adjustedValue}</strong><b>{result.teamA.decision}</b></article><article><small>{result.teamB.team} receives</small><strong>{result.teamB.adjustedValue}</strong><b>{result.teamB.decision}</b></article></div><div className="verdict-reasons"><article><h3>{result.teamA.team}</h3>{result.teamA.reasons.map((reason) => <p key={reason}>· {reason}</p>)}</article><article><h3>{result.teamB.team}</h3>{result.teamB.reasons.map((reason) => <p key={reason}>· {reason}</p>)}</article></div><p className="context-note">{result.contextNote}</p>{result.balancingSuggestion && <aside><strong>WHAT WOULD MAKE THIS FAIR?</strong><p>{result.balancingSuggestion}</p></aside>}</section>}</>;
}
