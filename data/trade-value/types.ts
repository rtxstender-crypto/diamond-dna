import type { MilbLevel } from "@/data/models/prospect";
import type { PlayerRole } from "@/data/models/player";

export type TradeRole = "hitter" | "starter" | "reliever" | "prospect";
export type ContractStatus = "pre-arbitration" | "arbitration" | "guaranteed" | "rental" | "unknown";

export interface ContractData {
  currentSalary: number | null;
  guaranteedRemaining: number | null;
  yearsRemaining: number | null;
  preArbitrationYears: number | null;
  arbitrationYears: number | null;
  clubOptions: number | null;
  playerOptions: number | null;
  hasOptOut: boolean | null;
  freeAgentYear: number | null;
  status: ContractStatus;
  source: "verified-provider" | "unavailable";
}

export interface MlbSeasonInput {
  season: number;
  games: number | null;
  plateAppearances?: number | null;
  ops?: number | null;
  obp?: number | null;
  slg?: number | null;
  walkRate?: number | null;
  strikeoutRate?: number | null;
  homeRuns?: number | null;
  stolenBases?: number | null;
  gamesStarted?: number | null;
  inningsPitched?: number | null;
  era?: number | null;
  whip?: number | null;
  saves?: number | null;
}

export interface MlbTradeInput {
  kind: "mlb";
  id: number;
  name: string;
  teamId: number;
  team: string;
  position: string;
  role: Exclude<TradeRole, "prospect">;
  age: number | null;
  seasons: MlbSeasonInput[];
  contract: ContractData;
}

export interface ProspectTradeInput {
  kind: "prospect";
  id: number;
  name: string;
  teamId: number;
  team: string;
  position: string;
  role: PlayerRole;
  age: number | null;
  level: MilbLevel;
  seasons: MlbSeasonInput[];
}

export type TradeAssetInput = MlbTradeInput | ProspectTradeInput;
export type ComponentKey = "production" | "contract" | "control" | "age" | "scarcity" | "confidence" | "stability" | "ageVsLevel" | "proximity" | "trend" | "developmentRisk";
export type PerformanceTrend = "improving" | "stable" | "mildly declining" | "materially declining" | "uncertain";
export type ProspectTier = "Elite Prospect" | "Premium Prospect" | "Strong Prospect" | "Top-100 Caliber Prospect" | "Interesting Non-Top-100 Prospect" | "Depth Prospect" | "Organizational Depth";
export interface TradeValueComponent { key: ComponentKey; label: string; score: number | null; weight: number; contribution: number | null; note: string }
export interface TradeValueResult {
  version: "Trade Value V2";
  playerId: number;
  playerType: "MLB" | "Prospect";
  role: TradeRole;
  value: number;
  maximumAvailable: number;
  provisional: boolean;
  assetLabel: "Franchise-Asset Level" | "Elite Asset" | "Positive Asset" | "Depth Asset" | "Negative Asset Value" | null;
  components: TradeValueComponent[];
  reasons: string[];
  limitations: string[];
  performanceTrend?: PerformanceTrend;
  prospectTier?: ProspectTier;
  preRiskTalent?: number;
  developmentRiskMultiplier?: number;
}

export interface TradeSideInput { teamId: number; team: string; assets: TradeAssetInput[] }
export type Decision = "Strong Accept" | "Lean Accept" | "Fair / Likely Considered" | "Lean Decline" | "Strong Decline";
export interface EvaluatedSide { teamId: number; team: string; receives: TradeValueResult[]; rawValue: number; adjustedValue: number; decision: Decision; differencePercent: number; reasons: string[] }
export interface TradeEvaluation { version: "Trade Value V2"; teamA: EvaluatedSide; teamB: EvaluatedSide; verdict: string; fair: boolean; contextApplied: false; contextNote: string; balancingSuggestion: string | null }
