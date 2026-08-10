import { describe, expect, it, vi } from "vitest";
import type { PlayerDataProvider } from "./player-data-provider";
import { MockPlayerProvider } from "./mock-player-provider";
import { parseMlbFieldingPayload, parseMlbStatsPayload } from "./mlb-stats-api-provider";
import { loadPlayersWithFallback } from "../player-service";
import { fieldingFixture, hittingFixture, pitchingFixture } from "./__fixtures__/mlb-stats";

const retrievedAt = "2026-08-09T12:00:00.000Z";

describe("MLB Stats API parsing", () => {
  it("maps verified hitting identity, offense, and fielding fields", () => {
    const fielding = parseMlbFieldingPayload(fieldingFixture, retrievedAt);
    const [player] = parseMlbStatsPayload(hittingFixture, "position-player", 2026, fielding, retrievedAt);
    expect(player.identity).toMatchObject({ mlbId: 670541, name: "Yordan Alvarez", team: "Houston Astros", position: "DH", age: 29 });
    expect(player.currentSeason).toMatchObject({ kind: "batting", games: 117, plateAppearances: 515, battingAverage: 0.323, onBasePercentage: 0.437, sluggingPercentage: 0.627, ops: 1.064, homeRuns: 35, rbi: 86, stolenBases: 1, walks: 82, strikeouts: 89, war: null });
    expect(player.defense).toMatchObject({ primaryPosition: "LF", games: 25, innings: 163.2, errors: 0, fieldingPercentage: 1 });
    expect(player.provenance).toMatchObject({ provider: "mlb-stats-api", quality: "live" });
    expect(player.gemScore).toBeNull();
  });

  it("maps verified pitching fields and leaves unsupported fields null", () => {
    const [player] = parseMlbStatsPayload(pitchingFixture, "pitcher", 2026, new Map(), retrievedAt);
    expect(player.currentSeason).toMatchObject({ kind: "pitching", games: 22, gamesStarted: 22, inningsPitched: 133, era: 1.76, whip: 0.74, strikeouts: 204, walks: 30, saves: 0, war: null, fip: null, eraPlus: null });
    expect(player.salary).toBeNull();
  });

  it("rejects malformed response sections instead of throwing", () => {
    expect(parseMlbStatsPayload({ stats: [{ splits: [{ player: { id: "bad" } }] }] }, "position-player", 2026, new Map(), retrievedAt)).toEqual([]);
    expect(parseMlbStatsPayload(null, "pitcher", 2026, new Map(), retrievedAt)).toEqual([]);
  });
});

describe("provider fallback", () => {
  it("uses mock data when the live provider fails", async () => {
    const failingProvider: PlayerDataProvider = {
      id: "failing",
      capabilities: { identity: false, standardBatting: false, standardPitching: false, standardFielding: false, statcastDefense: false, winsAboveReplacement: false, awards: false, salary: false },
      listPlayers: vi.fn().mockRejectedValue(new Error("offline")),
      getPlayer: vi.fn().mockResolvedValue(null),
    };
    const players = await loadPlayersWithFallback(failingProvider, new MockPlayerProvider(), { limit: 2 });
    expect(players).toHaveLength(2);
    expect(players.every(player => player.provenance.quality === "mock-fallback")).toBe(true);
  });
});
