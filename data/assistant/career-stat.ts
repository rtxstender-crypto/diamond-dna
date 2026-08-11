import type { AssistantAnswer, AssistantEvidence, AssistantPlayerContext, AssistantSeason } from "./types";

type Metric="games"|"plateAppearances"|"atBats"|"hits"|"runs"|"doubles"|"triples"|"homeRuns"|"rbi"|"stolenBases"|"walks"|"strikeouts"|"hitByPitch"|"sacrificeFlies"|"avg"|"obp"|"slg"|"ops"|"starts"|"inningsPitched"|"wins"|"losses"|"earnedRuns"|"era"|"whip"|"saves"|"hitsAllowed"|"homeRunsAllowed";
type Definition={metric:Metric;label:string;pattern:RegExp;decimals?:number};
const definitions:Definition[]=[
  {metric:"homeRunsAllowed",label:"home runs allowed",pattern:/\b(home\s*runs?|homers?|HR)\s+allowed\b/i},{metric:"hitsAllowed",label:"hits allowed",pattern:/\bhits?\s+allowed\b/i},{metric:"plateAppearances",label:"plate appearances",pattern:/\b(PA|plate\s+appearances?)\b/i},{metric:"inningsPitched",label:"innings pitched",pattern:/\b(IP|innings?(?:\s+pitched)?)\b/i},{metric:"stolenBases",label:"stolen bases",pattern:/\b(SB|stolen\s+bases?)\b/i},
  {metric:"avg",label:"MLB batting average",pattern:/\b(AVG|batting\s+average)\b/i,decimals:3},{metric:"obp",label:"MLB on-base percentage",pattern:/\b(OBP|on[\s-]?base\s+percentage)\b/i,decimals:3},{metric:"slg",label:"MLB slugging percentage",pattern:/\b(SLG|slugging(?:\s+percentage)?)\b/i,decimals:3},{metric:"ops",label:"MLB OPS",pattern:/\bOPS\b/i,decimals:3},
  {metric:"homeRuns",label:"MLB home runs",pattern:/\b(HR|home\s*runs?|homers?)\b/i},{metric:"rbi",label:"MLB RBI",pattern:/\b(RBI|runs?\s+batted\s+in)\b/i},{metric:"walks",label:"MLB walks",pattern:/\b(BB|walks?)\b/i},{metric:"strikeouts",label:"MLB strikeouts",pattern:/\b(K|strikeouts?)\b/i},{metric:"atBats",label:"MLB at-bats",pattern:/\b(AB|at[\s-]?bats?)\b/i},{metric:"doubles",label:"MLB doubles",pattern:/\bdoubles?\b/i},{metric:"triples",label:"MLB triples",pattern:/\btriples?\b/i},{metric:"hitByPitch",label:"MLB hit by pitches",pattern:/\bhit\s+by\s+pitches?\b/i},{metric:"sacrificeFlies",label:"MLB sacrifice flies",pattern:/\bsacrifice\s+flies\b/i},{metric:"hits",label:"MLB hits",pattern:/\b(H|hits?)\b/i},{metric:"runs",label:"MLB runs",pattern:/\bruns?\b/i},
  {metric:"starts",label:"MLB starts",pattern:/\b(starts?|games?\s+started)\b/i},{metric:"wins",label:"MLB wins",pattern:/\bwins?\b/i},{metric:"losses",label:"MLB losses",pattern:/\blosses?\b/i},{metric:"era",label:"MLB ERA",pattern:/\b(ERA|earned\s+run\s+average)\b/i,decimals:2},{metric:"earnedRuns",label:"MLB earned runs",pattern:/\bearned\s+runs?\b/i},{metric:"whip",label:"MLB WHIP",pattern:/\bWHIP\b/i,decimals:2},{metric:"saves",label:"MLB saves",pattern:/\bsaves?\b/i},{metric:"games",label:"MLB games",pattern:/\bgames?(?:\s+played)?\b/i},
];
const totalMetrics=new Set<Metric>(["games","plateAppearances","atBats","hits","runs","doubles","triples","homeRuns","rbi","stolenBases","walks","strikeouts","hitByPitch","sacrificeFlies","starts","wins","losses","earnedRuns","saves","hitsAllowed","homeRunsAllowed"]);
const present=(value:number|null|undefined):value is number=>typeof value==="number"&&Number.isFinite(value);
const outs=(ip:number|null|undefined)=>!present(ip)?null:Math.trunc(ip)*3+Math.round((ip-Math.trunc(ip))*10);
const display=(value:number,decimals=0)=>decimals===3?value.toFixed(3).replace(/^0/,""):value.toFixed(decimals);
function identify(question:string){return definitions.find(definition=>definition.pattern.test(question))??null}
function sum(seasons:AssistantSeason[],read:(season:AssistantSeason)=>number|null|undefined){const values=seasons.map(read).filter(present);return values.length?values.reduce((a,b)=>a+b,0):null}
function calculate(metric:Metric,seasons:AssistantSeason[]):number|null{
  if(totalMetrics.has(metric))return sum(seasons,s=>s[metric] as number|null|undefined);
  const atBats=sum(seasons,s=>s.atBats),hits=sum(seasons,s=>s.hits),walks=sum(seasons,s=>s.walks),hbp=sum(seasons,s=>s.hitByPitch),sf=sum(seasons,s=>s.sacrificeFlies),doubles=sum(seasons,s=>s.doubles),triples=sum(seasons,s=>s.triples),hr=sum(seasons,s=>s.homeRuns);
  if(metric==="avg")return hits!==null&&atBats?hits/atBats:null;
  if(metric==="obp")return hits!==null&&walks!==null&&hbp!==null&&atBats!==null&&sf!==null&&atBats+walks+hbp+sf>0?(hits+walks+hbp)/(atBats+walks+hbp+sf):null;
  if(metric==="slg")return hits!==null&&doubles!==null&&triples!==null&&hr!==null&&atBats?((hits-doubles-triples-hr)+2*doubles+3*triples+4*hr)/atBats:null;
  if(metric==="ops"){const obp=calculate("obp",seasons),slg=calculate("slg",seasons);return obp!==null&&slg!==null?obp+slg:null}
  const totalOuts=seasons.map(s=>outs(s.inningsPitched)).filter(present).reduce((a,b)=>a+b,0),innings=totalOuts/3;
  if(metric==="inningsPitched")return totalOuts?Math.trunc(totalOuts/3)+(totalOuts%3)/10:null;
  if(metric==="era"){const er=sum(seasons,s=>s.earnedRuns);return er!==null&&innings?er*9/innings:null}
  if(metric==="whip"){const allowed=sum(seasons,s=>s.hitsAllowed);return allowed!==null&&walks!==null&&innings?(allowed+walks)/innings:null}
  return null;
}
function seasonValue(metric:Metric,season:AssistantSeason){return season[metric] as number|null|undefined}
export function answerCareerStat(context:AssistantPlayerContext,question:string):AssistantAnswer{
  const providerAvailable=Boolean(process.env.DIAMONDDNA_ASSISTANT_API_KEY&&process.env.DIAMONDDNA_ASSISTANT_MODEL),definition=identify(question),minorAsked=/\b(MiLB|minor[\s-]?league|minors)\b/i.test(question),scope=context.identity.kind==="mlb"?"MLB":"MiLB";
  const base={intent:"career-stat" as const,sourceLabel:context.identity.kind==="mlb"?"MLB Stats API yearByYear regular-season data":"MLB Stats API MiLB season data",freshness:context.freshness,usedLlm:false,providerAvailable};
  if(context.identity.kind==="milb"&&!minorAsked)return{...base,answer:`This profile contains MiLB data, not a verified MLB career record for ${context.identity.name}. Ask specifically for a MiLB or minor-league career statistic to use those seasons.`,evidence:[]};
  if(!definition)return{...base,answer:`DiamondDNA could not identify a supported career statistic in that question about ${context.identity.name}.`,evidence:[]};
  const seasons=context.seasons.filter(s=>context.identity.kind==="mlb"?s.level==="MLB":true),value=calculate(definition.metric,seasons);
  if(value===null)return{...base,answer:`DiamondDNA does not have the verified season components needed to calculate ${context.identity.name}'s career ${definition.label}. It will not substitute a single-season value.`,evidence:[]};
  const formatted=display(value,definition.decimals??0),metricLabel=definition.label.replace(/^MLB\s+/,""),scopedLabel=`${scope} ${metricLabel}`,answer=`${context.identity.name} has ${formatted} career ${scopedLabel}.`;
  const evidence:AssistantEvidence[]=[{label:`Career ${scopedLabel}`,value:formatted,note:`${seasons.length} available ${scope} regular season${seasons.length===1?"":"s"}`}];
  if(totalMetrics.has(definition.metric))for(const season of [...seasons].sort((a,b)=>b.season-a.season).slice(0,4)){const seasonStat=seasonValue(definition.metric,season);if(present(seasonStat))evidence.push({label:String(season.season),value:display(seasonStat),note:season.team??scope})}
  return{...base,answer,evidence};
}
