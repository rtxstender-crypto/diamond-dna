import type { DataProvenance, GemScoreDetails, PlayerRole } from "../models/player";

export type AssistantPlayerKind = "mlb" | "milb";
export type AssistantIntent =
  | "overview"
  | "current-season"
  | "career-history"
  | "season-comparison"
  | "strengths"
  | "weaknesses"
  | "gem-score"
  | "historical-similarity"
  | "milb-development"
  | "age-level"
  | "unsupported-game-level"
  | "unsupported-statcast"
  | "unknown";

export interface AssistantIdentity {
  officialId: number;
  name: string;
  team: string | null;
  position: string;
  age: number | null;
  bats: string | null;
  throws: string | null;
  role: PlayerRole;
  kind: AssistantPlayerKind;
  level: string | null;
}

export interface AssistantSeason {
  season: number;
  team: string | null;
  level: string | null;
  age: number | null;
  games: number | null;
  starts: number | null;
  plateAppearances: number | null;
  inningsPitched: number | null;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  era: number | null;
  whip: number | null;
  homeRuns: number | null;
  rbi: number | null;
  stolenBases: number | null;
  walks: number | null;
  strikeouts: number | null;
  saves: number | null;
  walkRate: number | null;
  strikeoutRate: number | null;
}

export interface AssistantSimilarity {
  playerName: string;
  currentSeason: number;
  historicalSeason: number;
  score: number | null;
  source: string;
}

export interface AssistantPlayerContext {
  identity: AssistantIdentity;
  currentSeason: AssistantSeason | null;
  seasons: AssistantSeason[];
  gemScore: number | null;
  gemScoreDetails: GemScoreDetails | null;
  similarities: AssistantSimilarity[];
  provenance: DataProvenance | { provider: "mlb-stats-api"; quality: "live"; retrievedAt: string | null; notes?: string };
  freshness: string | null;
}

export interface AssistantEvidence { label: string; value: string; note?: string }
export interface AssistantAnswer {
  answer: string;
  intent: AssistantIntent;
  evidence: AssistantEvidence[];
  sourceLabel: string;
  freshness: string | null;
  usedLlm: boolean;
  providerAvailable: boolean;
}

export interface AssistantHistoryItem { role: "user" | "assistant"; content: string; intent?: AssistantIntent }
export interface AssistantRequest { playerId: number; playerKind: AssistantPlayerKind; question: string; history: AssistantHistoryItem[] }
