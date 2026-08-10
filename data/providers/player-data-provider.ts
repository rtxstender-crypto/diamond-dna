import type { PlayerRecord, PlayerRole, StatScope } from "@/data/models/player";

export interface PlayerQuery {
  season?: number;
  scope?: StatScope;
  role?: PlayerRole;
  search?: string;
  limit?: number;
}

export interface ProviderCapabilities {
  identity: boolean;
  standardBatting: boolean;
  standardPitching: boolean;
  standardFielding: boolean;
  statcastDefense: boolean;
  winsAboveReplacement: boolean;
  awards: boolean;
  salary: boolean;
}

export interface PlayerDataProvider {
  readonly id: string;
  readonly capabilities: ProviderCapabilities;
  listPlayers(query?: PlayerQuery): Promise<PlayerRecord[]>;
  getPlayer(mlbId: number, query?: PlayerQuery): Promise<PlayerRecord | null>;
}
