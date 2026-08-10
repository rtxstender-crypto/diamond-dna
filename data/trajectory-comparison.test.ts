import { describe, expect, it } from "vitest";
import { buildCurrentPlayerSeasons, buildHistoricalSeasons, compareSeasons, filterHistoricalSeasons, findSeasonComparisons } from "./trajectory-comparison";
import { trajectoryPlayers } from "./trajectory";

describe("trajectory season architecture", () => {
  it("builds selectable current seasons ending in 2026", () => {
    const seasons = buildCurrentPlayerSeasons(trajectoryPlayers[0]);
    expect(seasons.at(-1)).toMatchObject({playerName:"Bobby Witt Jr.",season:2026,role:"hitter",dataQuality:"demo"});
    expect(seasons.every(season=>season.war!==null)).toBe(true);
  });

  it("filters historical seasons by decade and exact year", () => {
    const seasons = buildHistoricalSeasons("hitter");
    expect(filterHistoricalSeasons(seasons,"2000s").every(item=>item.season.season>=2000&&item.season.season<=2009)).toBe(true);
    expect(filterHistoricalSeasons(seasons,"specific",1998).every(item=>item.season.season===1998)).toBe(true);
    expect(filterHistoricalSeasons(seasons,"earlier").every(item=>item.season.season<1980)).toBe(true);
  });

  it("calculates score and evidence from stored metric differences", () => {
    const current = buildCurrentPlayerSeasons(trajectoryPlayers[0]).at(-1)!;
    const historical = {...current,playerId:"historical",playerName:"Historical Player",season:2001};
    const career = buildHistoricalSeasons("hitter")[0].career;
    const comparison = compareSeasons(current,historical,career);
    expect(comparison.similarityScore).toBe(100);
    expect(comparison.metrics.every(metric=>metric.closeness==="very-close")).toBe(true);
    expect(comparison.summary).toContain(comparison.strongestSimilarities[0].label);
  });

  it("returns unique historical players ranked by evidence-based score", () => {
    const current = buildCurrentPlayerSeasons(trajectoryPlayers[0]).at(-1)!;
    const matches = findSeasonComparisons(current,"2000s",undefined,3);
    expect(matches).toHaveLength(3);
    expect(new Set(matches.map(match=>match.historicalSeason.playerId)).size).toBe(3);
    expect(matches[0].similarityScore).toBeGreaterThanOrEqual(matches[1].similarityScore);
  });
});
