import type { BestGame, CareerHigh, GameHistory, HitterGameStats, MilestoneEvent, PlayerGameLog } from "./types";

const present=(value:number|null):value is number=>value!==null&&Number.isFinite(value);
export const inningsToOuts=(innings:number|null)=>!present(innings)?null:Math.trunc(innings)*3+Math.round((innings-Math.trunc(innings))*10);
const totalBases=(s:HitterGameStats)=>present(s.singles)&&present(s.doubles)&&present(s.triples)&&present(s.homeRuns)?s.singles+2*s.doubles+3*s.triples+4*s.homeRuns:null;

export function detectMilestones(games:PlayerGameLog[]):MilestoneEvent[]{
  const events:MilestoneEvent[]=[];
  for(const game of games){
    if(game.stats.kind==="batting"){
      const s=game.stats;
      if([s.singles,s.doubles,s.triples,s.homeRuns].every(v=>present(v)&&v>=1))events.push({type:"cycle",label:"Hit for the cycle",value:4,game});
      if(present(s.homeRuns)&&s.homeRuns>=2)events.push({type:"multi-hr",label:`${s.homeRuns}-HR game`,value:s.homeRuns,game});
      if(present(s.hits)&&s.hits>=4)events.push({type:"hits",label:s.hits>=6?`${s.hits}-hit game`:`${s.hits}-hit game`,value:s.hits,game});
      if(present(s.rbi)&&s.rbi>=4)events.push({type:"rbi",label:`${s.rbi}-RBI game`,value:s.rbi,game});
    }else{
      const s=game.stats,started=(s.gamesStarted??0)>0;
      if((s.completeGames??0)>0)events.push({type:"complete-game",label:"Complete game",value:s.inningsPitched,game});
      if((s.shutouts??0)>0)events.push({type:"shutout",label:"Shutout",value:s.inningsPitched,game});
      if(present(s.strikeouts)&&s.strikeouts>=10)events.push({type:"strikeouts",label:`${s.strikeouts}-strikeout game`,value:s.strikeouts,game});
      if(started&&s.earnedRuns===0&&present(s.inningsPitched)&&s.inningsPitched>=6)events.push({type:"scoreless-start",label:`${s.inningsPitched} scoreless innings`,value:s.inningsPitched,game});
      if(s.officialNoHitter===true)events.push({type:"no-hitter",label:"Official no-hitter",value:null,game});
      if(s.officialPerfectGame===true)events.push({type:"perfect-game",label:"Official perfect game",value:null,game});
    }
  }
  return events.sort((a,b)=>a.game.date.localeCompare(b.game.date));
}

function high(games:PlayerGameLog[],metric:CareerHigh["metric"],read:(g:PlayerGameLog)=>number|null):CareerHigh|null{
  const available=games.map(game=>({game,value:read(game)})).filter((x):x is {game:PlayerGameLog;value:number}=>present(x.value));
  if(!available.length)return null;const value=Math.max(...available.map(x=>x.value));return{metric,value,occurrences:available.filter(x=>x.value===value).map(x=>x.game)};
}
export function calculateCareerHighs(games:PlayerGameLog[]):CareerHigh[]{
  const batting=games.filter(g=>g.stats.kind==="batting"),pitching=games.filter(g=>g.stats.kind==="pitching");
  return [
    high(batting,"rbi",g=>g.stats.kind==="batting"?g.stats.rbi:null),high(batting,"homeRuns",g=>g.stats.kind==="batting"?g.stats.homeRuns:null),high(batting,"hits",g=>g.stats.kind==="batting"?g.stats.hits:null),high(batting,"stolenBases",g=>g.stats.kind==="batting"?g.stats.stolenBases:null),
    high(pitching,"strikeouts",g=>g.stats.kind==="pitching"?g.stats.strikeouts:null),high(pitching,"inningsPitched",g=>g.stats.kind==="pitching"?g.stats.inningsPitched:null),high(pitching,"scorelessOuting",g=>g.stats.kind==="pitching"&&g.stats.earnedRuns===0?g.stats.inningsPitched:null),
  ].filter((x):x is CareerHigh=>x!==null);
}
export const HITTER_BEST_GAME_FORMULA="hits×2 + HR×4 + RBI×1.5 + total bases×0.5 + walks×0.5 + stolen bases×1";
export const PITCHER_BEST_GAME_FORMULA="innings outs×0.5 + strikeouts×1.5 − earned runs×3 − hits×0.5 − walks×0.5";
export function scoreGame(game:PlayerGameLog):number|null{
  if(game.stats.kind==="batting"){const s=game.stats,tb=totalBases(s);if(![s.hits,s.homeRuns,s.rbi,tb,s.walks,s.stolenBases].some(present))return null;return (s.hits??0)*2+(s.homeRuns??0)*4+(s.rbi??0)*1.5+(tb??0)*.5+(s.walks??0)*.5+(s.stolenBases??0);}
  const s=game.stats,outs=inningsToOuts(s.inningsPitched);if(![outs,s.strikeouts,s.earnedRuns,s.hitsAllowed,s.walks].some(present))return null;return (outs??0)*.5+(s.strikeouts??0)*1.5-(s.earnedRuns??0)*3-(s.hitsAllowed??0)*.5-(s.walks??0)*.5;
}
export function calculateBestGame(games:PlayerGameLog[]):BestGame|null{const scored=games.map(game=>({game,score:scoreGame(game)})).filter((x):x is {game:PlayerGameLog;score:number}=>x.score!==null).sort((a,b)=>b.score-a.score||a.game.date.localeCompare(b.game.date));return scored[0]?{...scored[0],formula:scored[0].game.stats.kind==="batting"?HITTER_BEST_GAME_FORMULA:PITCHER_BEST_GAME_FORMULA}:null}
export function buildGameHistory(playerId:number,games:PlayerGameLog[],seasons:number[],refreshedAt:string|null,stale=false):GameHistory{return{playerId,role:games[0]?.role??"position-player",games,milestones:detectMilestones(games),careerHighs:calculateCareerHighs(games),bestGame:calculateBestGame(games),seasons,refreshedAt,source:"MLB Stats API",stale}}
