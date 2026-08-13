import { describe, expect, it } from "vitest";
import { validateTrade } from "./validation";
import type { MlbTradeInput, ProspectTradeInput } from "./types";

describe("MLB and MiLB assignment identity", () => {
  it("treats an MLB profile and rehab assignment with the same player ID as one asset", () => {
    const mlb = {
      kind: "mlb", id: 42, name: "Rehabbing Player", teamId: 110, team: "Team A",
      position: "C", role: "hitter", age: 28, seasons: [],
      contract: { currentSalary: null, guaranteedRemaining: null, yearsRemaining: null, preArbitrationYears: null, arbitrationYears: null, clubOptions: null, playerOptions: null, hasOptOut: null, freeAgentYear: null, status: "unknown", source: "unavailable" },
    } satisfies MlbTradeInput;
    const assignment = {
      kind: "prospect", id: 42, name: "Rehabbing Player", teamId: 111, team: "Team B",
      position: "C", role: "position-player", age: 28, level: "Triple-A", seasons: [],
    } satisfies ProspectTradeInput;
    expect(() => validateTrade(
      { teamId: 110, team: "Team A", assets: [mlb] },
      { teamId: 111, team: "Team B", assets: [assignment] },
    )).toThrow("rehab or MiLB assignment profiles");
  });
});
