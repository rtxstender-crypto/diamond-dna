import type { Metadata } from "next";
import { TradeSimulator } from "@/components/trade-simulator";
import { Eyebrow } from "@/components/ui";
import { MLB_TEAMS } from "@/data/trade-value/teams";
import { AiTradeBuilder } from "@/components/ai-trade-builder";
export const metadata:Metadata={title:"Trade Simulator",description:"Build and evaluate deterministic MLB trade packages with DiamondDNA Trade Value V1 Beta."};
export default function TradeSimulatorPage(){return <div className="subpage page-width trade-page"><header className="page-header"><div><Eyebrow>DETERMINISTIC ASSET VALUATION</Eyebrow><h1>Trade <em>Simulator</em></h1><p>Build two-team packages, inspect every value component, and evaluate the exchange with explainable rules.</p></div><div className="updated"><span>MODEL</span><strong>TRADE VALUE V2</strong><small className="source-fallback">● VERIFIED INPUTS ONLY</small></div></header><AiTradeBuilder/><TradeSimulator teams={MLB_TEAMS}/></div>}
