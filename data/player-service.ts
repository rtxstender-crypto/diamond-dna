import type { PlayerDataProvider } from "@/data/providers/player-data-provider";
import type { PlayerQuery } from "@/data/providers/player-data-provider";
import { MlbStatsApiProvider } from "@/data/providers/mlb-stats-api-provider";
import { MockPlayerProvider } from "@/data/providers/mock-player-provider";
import { rankGemScores } from "@/data/gem-score";

const liveProvider: PlayerDataProvider = new MlbStatsApiProvider();
const fallbackProvider: PlayerDataProvider = new MockPlayerProvider();

export function getPlayerDataProvider(): PlayerDataProvider {
  return liveProvider;
}

export async function loadPlayersWithFallback(primary: PlayerDataProvider, fallback: PlayerDataProvider, query: PlayerQuery = {}) {
  try {
    return await primary.listPlayers(query);
  } catch (error) {
    console.warn("DiamondDNA live player provider failed; using mock fallback.", error instanceof Error ? error.message : "Unknown provider error");
    return fallback.listPlayers(query);
  }
}

export async function getHiddenGemPlayers() {
  const players = await loadPlayersWithFallback(liveProvider, fallbackProvider);
  if (!players.every(player => player.provenance.quality === "live")) return players.map(player=>({...player,gemScore:null,gemScoreDetails:null}));
  return rankGemScores(players).slice(0,30);
}
