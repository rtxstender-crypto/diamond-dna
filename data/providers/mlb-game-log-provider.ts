import { DATA_CACHE_SECONDS, refreshWithStaleFallback } from "../cache-config";
import type { PlayerRole } from "../models/player";
import { buildGameHistory } from "../game-history/analytics";
import type { GameHistory, HitterGameStats, PitcherGameStats, PlayerGameLog } from "../game-history/types";

const BASE="https://statsapi.mlb.com/api/v1";
type RawRecord=Record<string,unknown>;
const object=(v:unknown):RawRecord=>v&&typeof v==="object"&&!Array.isArray(v)?v as RawRecord:{};
const num=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:typeof v==="string"&&v.trim()!==""&&Number.isFinite(Number(v))?Number(v):null;
const text=(v:unknown)=>typeof v==="string"&&v.trim()?v:null;
const innings=(v:unknown)=>{const value=text(v)??(typeof v==="number"?String(v):null);if(!value||!/^\d+(?:\.[012])?$/.test(value))return null;return Number(value)};
const statValue=(s:RawRecord,key:string)=>num(s[key]);
export interface GameLogProviderOptions { fetchImpl?:typeof fetch; now?:()=>Date }

export class MlbGameLogProvider{
  readonly id="mlb-stats-api";private fetchImpl:typeof fetch;private now:()=>Date;
  constructor(options:GameLogProviderOptions={}){this.fetchImpl=options.fetchImpl??fetch;this.now=options.now??(()=>new Date())}
  async getSeason(playerId:number,role:PlayerRole,season:number):Promise<{games:PlayerGameLog[];refreshedAt:string;stale:boolean}>{
    if(!Number.isInteger(playerId)||playerId<=0||!Number.isInteger(season))throw new Error("Invalid game-log request.");
    const current=season===this.now().getFullYear(),ttl=current?DATA_CACHE_SECONDS.currentSeasonGameLogs:DATA_CACHE_SECONDS.completedSeasonGameLogs;
    return refreshWithStaleFallback(`mlb-game-log:${playerId}:${role}:${season}`,async()=>{
      const group=role==="position-player"?"hitting":"pitching",url=`${BASE}/people/${playerId}/stats?stats=gameLog&group=${group}&season=${season}&hydrate=team,opponent,game`;
      const response=await this.fetchImpl(url,{signal:AbortSignal.timeout(10_000),next:{revalidate:ttl}} as RequestInit);if(!response.ok)throw new Error(`MLB game-log request failed (${response.status}).`);
      const payload:unknown=await response.json(),games=parseGameLogPayload(payload,playerId,role,season,this.now().toISOString());return{games,refreshedAt:this.now().toISOString()};
    }).then(result=>({...result.data,stale:result.stale}));
  }
  async getCareer(playerId:number,role:PlayerRole,seasons:number[]):Promise<GameHistory>{const unique=[...new Set(seasons)].filter(Number.isInteger).sort((a,b)=>a-b);if(!unique.length)return buildGameHistory(playerId,[],[],null);const logs=await Promise.all(unique.map(season=>this.getSeason(playerId,role,season)));return buildGameHistory(playerId,logs.flatMap(x=>x.games),unique,logs.map(x=>x.refreshedAt).sort().at(-1)??null,logs.some(x=>x.stale))}
}

export function parseGameLogPayload(payload:unknown,playerId:number,role:PlayerRole,season:number,retrievedAt:string):PlayerGameLog[]{
  const stats=object(payload).stats;if(!Array.isArray(stats))return[];const splits=stats.flatMap(block=>Array.isArray(object(block).splits)?object(block).splits as unknown[]:[]);const games:PlayerGameLog[]=[];
  for(const raw of splits){const split=object(raw),game=object(split.game),opponent=object(split.opponent),stat=object(split.stat),gameId=num(game.gamePk);const date=text(split.date);if(!gameId||!date)continue;const common={playerId,gameId,date,season,opponent:text(opponent.name),opponentId:num(opponent.id),homeAway:typeof split.isHome==="boolean"?(split.isHome?"home" as const:"away" as const):null,finalScore:null,role,provenance:{provider:"mlb-stats-api" as const,quality:"live" as const,retrievedAt,notes:"Official MLB Stats API gameLog split; unsupported fields remain N/A."}};
    if(role==="position-player"){const hits=statValue(stat,"hits"),doubles=statValue(stat,"doubles"),triples=statValue(stat,"triples"),homeRuns=statValue(stat,"homeRuns");const singles=[hits,doubles,triples,homeRuns].every(v=>v!==null)?hits!-doubles!-triples!-homeRuns!:null;const batting:HitterGameStats={kind:"batting",atBats:statValue(stat,"atBats"),plateAppearances:statValue(stat,"plateAppearances"),hits,singles,doubles,triples,homeRuns,rbi:statValue(stat,"rbi"),runs:statValue(stat,"runs"),walks:statValue(stat,"baseOnBalls"),strikeouts:statValue(stat,"strikeOuts"),stolenBases:statValue(stat,"stolenBases"),grandSlams:null};games.push({...common,stats:batting});}
    else{const pitching:PitcherGameStats={kind:"pitching",inningsPitched:innings(stat.inningsPitched),hitsAllowed:statValue(stat,"hits"),runsAllowed:statValue(stat,"runs"),earnedRuns:statValue(stat,"earnedRuns"),walks:statValue(stat,"baseOnBalls"),strikeouts:statValue(stat,"strikeOuts"),homeRunsAllowed:statValue(stat,"homeRuns"),pitches:statValue(stat,"numberOfPitches"),wins:statValue(stat,"wins"),losses:statValue(stat,"losses"),saves:statValue(stat,"saves"),gamesStarted:statValue(stat,"gamesStarted"),completeGames:statValue(stat,"completeGames"),shutouts:statValue(stat,"shutouts"),officialNoHitter:null,officialPerfectGame:null};games.push({...common,stats:pitching});}
  }return games;
}
export const mlbGameLogProvider=new MlbGameLogProvider();
