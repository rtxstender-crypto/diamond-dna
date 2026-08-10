/**
 * Canonical DiamondDNA player model.
 *
 * Every metric is nullable by design. Providers must return null when a value is
 * absent or cannot be verified; UI code should render null with formatStat().
 * See docs/DATA_SOURCES.md for the intended provider for every metric.
 */
export type PlayerRole = "position-player" | "pitcher";
export type StatScope = "season" | "career";
export type DataQuality = "live" | "verified-import" | "mock-fallback" | "unavailable";
export type DataSourceId =
  | "mlb-stats-api"
  | "baseball-savant"
  | "fangraphs"
  | "baseball-reference"
  | "sports-info-solutions"
  | "salary-provider"
  | "unavailable"
  | "mock";

export interface DataProvenance {
  provider: DataSourceId;
  quality: DataQuality;
  retrievedAt: string | null;
  notes?: string;
}

export interface PlayerIdentity {
  mlbId: number | null;
  slug: string;
  name: string;
  team: string;
  teamCode: string;
  position: string;
  age: number | null;
  role: PlayerRole;
}

export interface StatContext {
  scope: StatScope;
  season: number | null;
}

export interface RecognitionStats {
  goldGloves: number | null;
  platinumGloves: number | null;
  allStarSelections: number | null;
  silverSluggers: number | null;
  mvpAwards: number | null;
  mvpFinishes: { season: number; place: number; points: number | null }[] | null;
  cyYoungAwards: number | null;
  cyYoungFinishes: { season: number; place: number; points: number | null }[] | null;
  provenance: DataProvenance;
}

export interface DefensiveStats {
  primaryPosition: string | null;
  games: number | null;
  innings: number | null;
  errors: number | null;
  outsAboveAverage: number | null;
  defensiveRunsSaved: number | null;
  defensiveWar: number | null;
  fieldingPercentage: number | null;
  provenance: DataProvenance;
}

export interface PositionPlayerStats {
  kind: "batting";
  context: StatContext;
  games: number | null;
  plateAppearances: number | null;
  battingAverage: number | null;
  onBasePercentage: number | null;
  sluggingPercentage: number | null;
  ops: number | null;
  opsPlus: number | null;
  homeRuns: number | null;
  rbi: number | null;
  stolenBases: number | null;
  walks: number | null;
  strikeouts: number | null;
  walkRate: number | null;
  strikeoutRate: number | null;
  war: number | null;
  provenance: DataProvenance;
}

export interface PitcherStats {
  kind: "pitching";
  context: StatContext;
  games: number | null;
  gamesStarted: number | null;
  inningsPitched: number | null;
  era: number | null;
  eraPlus: number | null;
  fip: number | null;
  whip: number | null;
  strikeouts: number | null;
  walks: number | null;
  battersFaced: number | null;
  strikeoutRate: number | null;
  walkRate: number | null;
  war: number | null;
  saves: number | null;
  provenance: DataProvenance;
}

export interface PlayerRecord {
  identity: PlayerIdentity;
  currentSeason: PositionPlayerStats | PitcherStats;
  career: PositionPlayerStats | PitcherStats | null;
  defense: DefensiveStats;
  recognition: RecognitionStats;
  salary: number | null;
  salaryProvenance: DataProvenance;
  gemScore: number | null;
  gemScoreDetails: GemScoreDetails | null;
  trend: string | null;
  accent: string;
  provenance: DataProvenance;
}

export type GemCategoryKey = "performance" | "ageUpside" | "defense" | "value" | "recognitionGap";
export interface GemCategoryScore { key: GemCategoryKey; label: string; score: number | null; configuredWeight: number; activeWeight: number | null }
export interface GemMetricEvidence { metric: string; percentile: number; direction: "positive" | "negative"; description: string }
export interface GemScoreDetails {
  version: "Gem Score v1";
  eligible: boolean;
  sampleStatus: string;
  roleGroup: "hitter" | "starter" | "reliever";
  categories: GemCategoryScore[];
  positiveFactors: GemMetricEvidence[];
  limitingFactors: GemMetricEvidence[];
  metricsUsed: number;
  source: "MLB Stats API";
}

export function formatStat(value: number | null, options?: { decimals?: number; percent?: boolean; currency?: boolean }): string {
  if (value === null || !Number.isFinite(value)) return "N/A";
  if (options?.currency) return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const formatted = value.toFixed(options?.decimals ?? 0);
  return options?.percent ? `${formatted}%` : formatted;
}
