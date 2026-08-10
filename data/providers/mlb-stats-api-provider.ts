import type { DataProvenance, DefensiveStats, PitcherStats, PlayerRecord, PositionPlayerStats } from "@/data/models/player";
import type { PlayerDataProvider, PlayerQuery } from "./player-data-provider";
import { DATA_CACHE_SECONDS } from "../cache-config";

type JsonObject = Record<string, unknown>;
type CachedRequestInit = RequestInit & { next?: { revalidate: number } };

export interface MlbProviderOptions {
  fetcher?: typeof fetch;
  season?: number;
  revalidateSeconds?: number;
}

const accents = ["#f2c14e", "#58a6ff", "#5aa7e8", "#47c5a5", "#18b7d2", "#9bcf61"];
const sharedFields="stats,splits,season,player,id,fullName,nameSlug,currentAge,primaryPosition,type,abbreviation,team,id,name,abbreviation,position,abbreviation,stat";
const hittingFields=`${sharedFields},gamesPlayed,plateAppearances,avg,obp,slg,ops,homeRuns,rbi,stolenBases,baseOnBalls,strikeOuts,age`;
const pitchingFields=`${sharedFields},gamesPlayed,gamesPitched,gamesStarted,inningsPitched,era,whip,strikeOuts,baseOnBalls,battersFaced,saves,age`;
const fieldingFields="people,id,stats,splits,position,abbreviation,stat,games,gamesPlayed,innings,errors,fielding";

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function objectAt(value: JsonObject, key: string): JsonObject | null {
  return isObject(value[key]) ? value[key] : null;
}

function numberAt(value: JsonObject, key: string): number | null {
  const raw = value[key];
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringAt(value: JsonObject, key: string): string | null {
  return typeof value[key] === "string" && value[key].trim() ? value[key].trim() : null;
}

function splitsFrom(payload: unknown): JsonObject[] {
  if (!isObject(payload)) return [];
  const rootGroups = Array.isArray(payload.stats) ? payload.stats : [];
  const peopleGroups = Array.isArray(payload.people) ? payload.people.flatMap(person => isObject(person) && Array.isArray(person.stats) ? person.stats : []) : [];
  return rootGroups.concat(peopleGroups).flatMap(group => isObject(group) && Array.isArray(group.splits) ? group.splits.filter(isObject) : []);
}

function playerIdsFrom(payload: unknown): number[] {
  return splitsFrom(payload).flatMap(split => {
    const player = objectAt(split, "player");
    const id = player ? numberAt(player, "id") : null;
    return id === null ? [] : [id];
  });
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const unavailableProvenance: DataProvenance = { provider: "unavailable", quality: "unavailable", retrievedAt: null };

export function parseMlbFieldingPayload(payload: unknown, retrievedAt: string): Map<number, DefensiveStats> {
  const provenance: DataProvenance = { provider: "mlb-stats-api", quality: "live", retrievedAt };
  const result = new Map<number, DefensiveStats>();
  for (const split of splitsFrom(payload)) {
    const player = objectAt(split, "player");
    const stat = objectAt(split, "stat");
    const position = objectAt(split, "position");
    if (!player || !stat) continue;
    const mlbId = numberAt(player, "id");
    if (mlbId === null) continue;
    const candidate: DefensiveStats = {
      primaryPosition: position ? stringAt(position, "abbreviation") : null,
      games: numberAt(stat, "games") ?? numberAt(stat, "gamesPlayed"),
      innings: numberAt(stat, "innings"),
      errors: numberAt(stat, "errors"),
      fieldingPercentage: numberAt(stat, "fielding"),
      outsAboveAverage: null,
      defensiveRunsSaved: null,
      defensiveWar: null,
      provenance,
    };
    const previous = result.get(mlbId);
    if (!previous || (candidate.innings ?? -1) > (previous.innings ?? -1)) result.set(mlbId, candidate);
  }
  return result;
}

export function parseMlbStatsPayload(payload: unknown, role: "position-player" | "pitcher", season: number, fielding: Map<number, DefensiveStats>, retrievedAt: string): PlayerRecord[] {
  const provenance: DataProvenance = { provider: "mlb-stats-api", quality: "live", retrievedAt };
  return splitsFrom(payload).flatMap((split, index): PlayerRecord[] => {
    const player = objectAt(split, "player");
    const team = objectAt(split, "team");
    const position = objectAt(split, "position") ?? (player ? objectAt(player, "primaryPosition") : null);
    const stat = objectAt(split, "stat");
    if (!player || !team || !position || !stat) return [];
    const mlbId = numberAt(player, "id");
    const name = stringAt(player, "fullName");
    const teamName = stringAt(team, "name");
    const teamCode = stringAt(team, "abbreviation");
    const positionCode = stringAt(position, "abbreviation");
    if (mlbId === null || !name || !teamName || !teamCode || !positionCode) return [];

    const currentSeason: PositionPlayerStats | PitcherStats = role === "position-player" ? {
      kind: "batting", context: { scope: "season", season }, games: numberAt(stat, "gamesPlayed"), plateAppearances: numberAt(stat, "plateAppearances"), battingAverage: numberAt(stat, "avg"), onBasePercentage: numberAt(stat, "obp"), sluggingPercentage: numberAt(stat, "slg"), ops: numberAt(stat, "ops"), opsPlus: null, homeRuns: numberAt(stat, "homeRuns"), rbi: numberAt(stat, "rbi"), stolenBases: numberAt(stat, "stolenBases"), walks: numberAt(stat, "baseOnBalls"), strikeouts: numberAt(stat, "strikeOuts"), walkRate: null, strikeoutRate: null, war: null, provenance,
    } : {
      kind: "pitching", context: { scope: "season", season }, games: numberAt(stat, "gamesPlayed") ?? numberAt(stat, "gamesPitched"), gamesStarted: numberAt(stat, "gamesStarted"), inningsPitched: numberAt(stat, "inningsPitched"), era: numberAt(stat, "era"), eraPlus: null, fip: null, whip: numberAt(stat, "whip"), strikeouts: numberAt(stat, "strikeOuts"), walks: numberAt(stat, "baseOnBalls"), battersFaced: numberAt(stat, "battersFaced"), strikeoutRate: null, walkRate: null, war: null, saves: numberAt(stat, "saves"), provenance,
    };

    return [{
      identity: { mlbId, slug: stringAt(player, "nameSlug") ?? `${slugify(name)}-${mlbId}`, name, team: teamName, teamCode, position: positionCode, age: numberAt(player, "currentAge") ?? numberAt(stat, "age"), role },
      currentSeason,
      career: null,
      defense: fielding.get(mlbId) ?? { primaryPosition: positionCode, games: null, innings: null, errors: null, outsAboveAverage: null, defensiveRunsSaved: null, defensiveWar: null, fieldingPercentage: null, provenance: unavailableProvenance },
      recognition: { goldGloves: null, platinumGloves: null, allStarSelections: null, silverSluggers: null, mvpAwards: null, mvpFinishes: null, cyYoungAwards: null, cyYoungFinishes: null, provenance: unavailableProvenance },
      salary: null,
      salaryProvenance: unavailableProvenance,
      gemScore: null,
      gemScoreDetails: null,
      trend: null,
      accent: accents[index % accents.length],
      provenance,
    }];
  });
}

export class MlbStatsApiProvider implements PlayerDataProvider {
  readonly id = "mlb-stats-api";
  readonly baseUrl = "https://statsapi.mlb.com/api/v1";
  readonly capabilities = { identity: true, standardBatting: true, standardPitching: true, standardFielding: true, statcastDefense: false, winsAboveReplacement: false, awards: false, salary: false };
  private readonly fetcher: typeof fetch;
  private readonly season: number;
  private readonly revalidateSeconds: number;

  constructor(options: MlbProviderOptions = {}) {
    this.fetcher = options.fetcher ?? fetch;
    this.season = options.season ?? new Date().getFullYear();
    this.revalidateSeconds = options.revalidateSeconds ?? DATA_CACHE_SECONDS.currentSeasonStats;
  }

  private async fetchJson(path: string): Promise<unknown> {
    const init: CachedRequestInit = { signal: AbortSignal.timeout(10_000), next: { revalidate: this.revalidateSeconds } };
    const response = await this.fetcher(`${this.baseUrl}${path}`, init);
    if (!response.ok) throw new Error(`MLB Stats API returned ${response.status}`);
    return response.json() as Promise<unknown>;
  }

  async listPlayers(query: PlayerQuery = {}): Promise<PlayerRecord[]> {
    const season = query.season ?? this.season;
    const common = `stats=season&season=${season}&sportIds=1&playerPool=ALL&hydrate=person,team&limit=2000`;
    const [hittingPayload, pitchingPayload] = await Promise.all([
      this.fetchJson(`/stats?${common}&group=hitting&sortStat=onBasePlusSlugging&fields=${hittingFields}`),
      this.fetchJson(`/stats?${common}&group=pitching&sortStat=earnedRunAverage&fields=${pitchingFields}`),
    ]);
    const playerIds = Array.from(new Set(playerIdsFrom(hittingPayload).concat(playerIdsFrom(pitchingPayload))).values()).slice(0, 300);
    const hydrate = `stats(group=[fielding],type=[season],season=${season})`;
    const fieldingPayload = playerIds.length ? await this.fetchJson(`/people?personIds=${playerIds.join(",")}&hydrate=${hydrate}&fields=${fieldingFields}`) : null;
    const retrievedAt = new Date().toISOString();
    const fielding = parseMlbFieldingPayload(fieldingPayload, retrievedAt);
    const hitters = parseMlbStatsPayload(hittingPayload, "position-player", season, fielding, retrievedAt);
    const pitchers = parseMlbStatsPayload(pitchingPayload, "pitcher", season, fielding, retrievedAt);
    let players = query.role === "position-player" ? hitters : query.role === "pitcher" ? pitchers : hitters.concat(pitchers);
    if (query.search) players = players.filter(player => player.identity.name.toLowerCase().includes(query.search!.toLowerCase()));
    players = players.slice(0, query.limit ?? players.length);
    if (!players.length) throw new Error("MLB Stats API returned no valid player records");
    return players;
  }

  async getPlayer(mlbId: number, query: PlayerQuery = {}): Promise<PlayerRecord | null> {
    const players = await this.listPlayers({ ...query, limit: 200 });
    return players.find(player => player.identity.mlbId === mlbId) ?? null;
  }
}
