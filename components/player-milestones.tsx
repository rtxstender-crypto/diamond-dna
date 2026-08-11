"use client";
import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { GameHistory } from "@/data/game-history/types";

const formatDate=(value:string)=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`));
export function PlayerMilestones({playerId}:{playerId:number}){
  const[data,setData]=useState<GameHistory|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[expanded,setExpanded]=useState(false);
  async function load(){setLoading(true);setError(null);try{const response=await fetch(`/api/players/${playerId}/milestones`);const body=await response.json();if(!response.ok)throw new Error(body.error??"Unable to load milestones.");setData(body)}catch(e){setError(e instanceof Error?e.message:"Unable to load milestones.")}finally{setLoading(false)}}
  const events=data?.milestones??[],visible=expanded?events:events.slice(0,3);
  return <section className="profile-section milestone-section"><div className="profile-section-head"><h2>Milestones & Game History</h2><span>VERIFIED MLB GAMES</span></div>
    {!data&&!loading&&!error&&<div className="milestone-empty"><p>Game history stays unloaded until you ask for it.</p><button className="button secondary" onClick={load}>Load verified milestones</button></div>}
    {loading&&<p className="profile-unavailable">Loading official game logs…</p>}{error&&<div className="milestone-empty"><p>{error} No milestone claims were generated.</p><button className="button secondary" onClick={load}>Try again</button></div>}
    {data&&<>{visible.length?<ol className="milestone-list">{visible.map((event,index)=><li key={`${event.game.gameId}-${event.type}-${index}`}><CalendarDays/><div><strong>{formatDate(event.game.date)} — {event.label}</strong><span>{event.game.homeAway==="away"?"at":"vs."} {event.game.opponent??"N/A"} · Game {event.game.gameId}</span></div></li>)}</ol>:<p className="profile-unavailable">No supported notable milestones were found in the verified game logs currently available.</p>}{events.length>3&&<button className="milestone-expand" onClick={()=>setExpanded(v=>!v)}>{expanded?"Show less":`View all ${events.length}`}<ChevronDown className={expanded?"open":""}/></button>}<p className="profile-source">MLB Stats API · refreshed {data.refreshedAt?formatDate(data.refreshedAt.slice(0,10)):"N/A"} · unsupported events remain N/A</p></>}
  </section>
}
