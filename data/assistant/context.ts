import "server-only";
import { getPlayerProfile } from "../player-index-service";
import { fetchProspectDataset } from "../providers/mlb-milb-provider";
import type { AssistantPlayerContext, AssistantSeason } from "./types";

export async function buildAssistantContext(playerId:number,kind:"mlb"|"milb"):Promise<AssistantPlayerContext|null>{
  return kind==="mlb"?buildMlbContext(playerId):buildMilbContext(playerId);
}
async function buildMlbContext(playerId:number):Promise<AssistantPlayerContext|null>{
  const profile=await getPlayerProfile(playerId);if(!profile)return null;const{identity,current,career}=profile,stats=current?.currentSeason??null;
  const currentSeason:AssistantSeason|null=stats?{season:stats.context.season??new Date().getFullYear(),team:identity.team,level:"MLB",age:identity.age,games:stats.games,starts:stats.kind==="pitching"?stats.gamesStarted:null,plateAppearances:stats.kind==="batting"?stats.plateAppearances:null,inningsPitched:stats.kind==="pitching"?stats.inningsPitched:null,avg:stats.kind==="batting"?stats.battingAverage:null,obp:stats.kind==="batting"?stats.onBasePercentage:null,slg:stats.kind==="batting"?stats.sluggingPercentage:null,ops:stats.kind==="batting"?stats.ops:null,era:stats.kind==="pitching"?stats.era:null,whip:stats.kind==="pitching"?stats.whip:null,homeRuns:stats.kind==="batting"?stats.homeRuns:null,rbi:stats.kind==="batting"?stats.rbi:null,stolenBases:stats.kind==="batting"?stats.stolenBases:null,walks:stats.walks,strikeouts:stats.strikeouts,saves:stats.kind==="pitching"?stats.saves:null,walkRate:stats.walkRate,strikeoutRate:stats.strikeoutRate}:null;
  const seasons:AssistantSeason[]=career.map(s=>({season:s.season,team:s.team,level:"MLB",age:s.age,games:s.games,starts:s.starts,plateAppearances:s.plateAppearances,inningsPitched:s.inningsPitched,avg:s.avg,obp:s.obp,slg:s.slg,ops:s.ops,era:s.era,whip:s.whip,homeRuns:s.homeRuns,rbi:s.rbi,stolenBases:s.stolenBases,walks:s.walks,strikeouts:s.strikeouts,saves:s.saves,walkRate:s.walkRate,strikeoutRate:s.strikeoutRate}));
  const provenance=current?.provenance??{provider:"mlb-stats-api" as const,quality:"live" as const,retrievedAt:null,notes:"Identity and career history from MLB Stats API; current statistics unavailable."};
  return{identity:{officialId:identity.mlbId,name:identity.name,team:identity.team,position:identity.position,age:identity.age,bats:identity.bats,throws:identity.throws,role:identity.role,kind:"mlb",level:"MLB"},currentSeason,seasons,gemScore:current?.gemScore??null,gemScoreDetails:current?.gemScoreDetails??null,similarities:[],provenance,freshness:provenance.retrievedAt};
}

async function buildMilbContext(playerId:number):Promise<AssistantPlayerContext|null>{
  const dataset=await fetchProspectDataset(),player=dataset.players.find(candidate=>candidate.playerId===playerId);if(!player)return null;
  const seasons:AssistantSeason[]=player.statLines.map(s=>({season:s.season,team:s.team,level:s.level,age:player.age,games:s.games,starts:s.starts,plateAppearances:s.plateAppearances,inningsPitched:s.inningsPitched,avg:s.avg,obp:s.obp,slg:s.slg,ops:s.ops,era:s.era,whip:s.whip,homeRuns:s.homeRuns,rbi:s.rbi,stolenBases:s.stolenBases,walks:s.walks,strikeouts:s.strikeouts,saves:s.saves,walkRate:s.walkRate,strikeoutRate:s.strikeoutRate}));
  const currentSeason=[...seasons].sort((a,b)=>b.season-a.season)[0]??null;
  return{identity:{officialId:player.playerId,name:player.name,team:player.organization,position:player.position,age:player.age,bats:player.bats,throws:player.throws,role:player.role,kind:"milb",level:player.level},currentSeason,seasons,gemScore:null,gemScoreDetails:null,similarities:[],provenance:{provider:"mlb-stats-api",quality:"live",retrievedAt:dataset.refreshedAt,notes:dataset.stale?"Serving the last verified MiLB snapshot because refresh failed.":"Official MiLB rosters and standard statistics."},freshness:dataset.refreshedAt};
}
