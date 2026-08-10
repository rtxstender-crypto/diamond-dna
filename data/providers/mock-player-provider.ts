import type { PlayerDataProvider, PlayerQuery } from "./player-data-provider";
import type { DataProvenance, PitcherStats, PlayerRecord, PositionPlayerStats } from "@/data/models/player";

const mockProvenance: DataProvenance = { provider: "mock", quality: "mock-fallback", retrievedAt: null, notes: "Development fallback; not verified MLB data." };
const emptyDefense = { primaryPosition: null, games: null, innings: null, errors: null, outsAboveAverage: null, defensiveRunsSaved: null, defensiveWar: null, fieldingPercentage: null, provenance: mockProvenance };
const emptyRecognition = { goldGloves: null, platinumGloves: null, allStarSelections: null, silverSluggers: null, mvpAwards: null, mvpFinishes: null, cyYoungAwards: null, cyYoungFinishes: null, provenance: mockProvenance };

function batting(season: number, war: number, opsPlus: number): PositionPlayerStats {
  return { kind: "batting", context: { scope: "season", season }, games: null, plateAppearances: null, battingAverage: null, onBasePercentage: null, sluggingPercentage: null, ops: null, opsPlus, homeRuns: null, rbi: null, stolenBases: null, walks: null, strikeouts: null, walkRate: null, strikeoutRate: null, war, provenance: mockProvenance };
}

function pitching(season: number, war: number, eraPlus: number): PitcherStats {
  return { kind: "pitching", context: { scope: "season", season }, games: null, gamesStarted: null, inningsPitched: null, era: null, eraPlus, fip: null, whip: null, strikeouts: null, walks: null, strikeoutRate: null, walkRate: null, war, saves: null, provenance: mockProvenance };
}

const seed = [
  { slug: "matthew-batten", name: "Matthew Batten", team: "San Diego Padres", teamCode: "SD", position: "UTIL", role: "position-player" as const, age: 29, stats: batting(2026, 2.4, 119), gemScore: 94, trend: "+18%", accent: "#f2c14e" },
  { slug: "ryan-pepiot", name: "Ryan Pepiot", team: "Tampa Bay Rays", teamCode: "TB", position: "SP", role: "pitcher" as const, age: 28, stats: pitching(2026, 3.1, 127), gemScore: 91, trend: "+14%", accent: "#58a6ff" },
  { slug: "davis-schneider", name: "Davis Schneider", team: "Toronto Blue Jays", teamCode: "TOR", position: "2B/LF", role: "position-player" as const, age: 27, stats: batting(2026, 2.8, 123), gemScore: 89, trend: "+12%", accent: "#5aa7e8" },
  { slug: "bryan-woo", name: "Bryan Woo", team: "Seattle Mariners", teamCode: "SEA", position: "SP", role: "pitcher" as const, age: 26, stats: pitching(2026, 2.7, 124), gemScore: 87, trend: "+11%", accent: "#47c5a5" },
  { slug: "kyle-stowers", name: "Kyle Stowers", team: "Miami Marlins", teamCode: "MIA", position: "OF", role: "position-player" as const, age: 28, stats: batting(2026, 2.2, 116), gemScore: 84, trend: "+9%", accent: "#18b7d2" },
  { slug: "ben-brown", name: "Ben Brown", team: "Chicago Cubs", teamCode: "CHC", position: "SP", role: "pitcher" as const, age: 26, stats: pitching(2026, 2.5, 118), gemScore: 82, trend: "+8%", accent: "#5c8edc" },
];

const players: PlayerRecord[] = seed.map(player => ({
  identity: { mlbId: null, slug: player.slug, name: player.name, team: player.team, teamCode: player.teamCode, position: player.position, age: player.age, role: player.role },
  currentSeason: player.stats,
  career: null,
  defense: { ...emptyDefense, primaryPosition: player.position },
  recognition: emptyRecognition,
  salary: null,
  salaryProvenance: mockProvenance,
  gemScore: player.gemScore,
  trend: player.trend,
  accent: player.accent,
  provenance: mockProvenance,
}));

export class MockPlayerProvider implements PlayerDataProvider {
  readonly id = "mock";
  readonly capabilities = { identity: true, standardBatting: true, standardPitching: true, standardFielding: false, statcastDefense: false, winsAboveReplacement: false, awards: false, salary: false };
  async listPlayers(query: PlayerQuery = {}): Promise<PlayerRecord[]> {
    const matches = players.filter(player => (!query.role || player.identity.role === query.role) && (!query.search || player.identity.name.toLowerCase().includes(query.search.toLowerCase())));
    return matches.slice(0, query.limit ?? matches.length);
  }
  async getPlayer(mlbId: number): Promise<PlayerRecord | null> {
    return players.find(player => player.identity.mlbId === mlbId) ?? null;
  }
}
