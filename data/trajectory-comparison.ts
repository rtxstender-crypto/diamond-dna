export type HistoricalYearFilter = "all" | "2020s" | "2010s" | "2000s" | "1990s" | "1980s" | "earlier" | "specific";
export type TrajectoryRole = "hitter" | "pitcher";
export type PitchingRole = "Starter" | "Reliever" | null;
export type SeasonMetricKey = "age"|"games"|"starts"|"plateAppearances"|"inningsPitched"|"avg"|"obp"|"slg"|"ops"|"opsPlus"|"homeRuns"|"rbi"|"stolenBases"|"walkRate"|"strikeoutRate"|"era"|"eraPlus"|"fip"|"whip"|"strikeouts"|"saves"|"war"|"defensiveValue";
export type MetricFormat = "integer"|"decimal-1"|"decimal-2"|"rate-3"|"percent";

export interface StatProvenance { source:"MLB Stats API"; endpoint:string; retrievedAt:string; derived?:"BB / PA"|"K / PA"|"BB / BF"|"K / BF" }
export interface PlayerSeason {
  playerId:string; playerName:string; team:string|null; position:string; role:TrajectoryRole; pitchingRole:PitchingRole;
  season:number; age:number|null; games:number|null; starts:number|null; plateAppearances:number|null; inningsPitched:number|null;
  avg:number|null; obp:number|null; slg:number|null; ops:number|null; opsPlus:number|null; homeRuns:number|null; rbi:number|null;
  stolenBases:number|null; walks:number|null; walkRate:number|null; strikeoutRate:number|null; era:number|null; eraPlus:number|null; fip:number|null;
  whip:number|null; strikeouts:number|null; saves:number|null; war:number|null; defensiveValue:number|null;
  atBats?:number|null; hits?:number|null; runs?:number|null; doubles?:number|null; triples?:number|null; hitByPitch?:number|null; sacrificeFlies?:number|null;
  wins?:number|null; losses?:number|null; earnedRuns?:number|null; hitsAllowed?:number|null; homeRunsAllowed?:number|null;
  provenance:StatProvenance;
}
export interface CareerSeries { playerId:string; name:string; color:string; metricLabel:"OPS"|"ERA"; lowerIsBetter:boolean; series:{age:number;season:number;value:number}[] }
export interface MetricComparison { key:SeasonMetricKey;label:string;currentValue:number;historicalValue:number;normalizedDifference:number;closenessScore:number;closeness:"very-close"|"close"|"different";format:MetricFormat;weight:number }
export interface SeasonComparison { currentSeason:PlayerSeason;historicalSeason:PlayerSeason;historicalCareer:CareerSeries;similarityScore:number|null;metrics:MetricComparison[];strongestSimilarities:MetricComparison[];biggestDifferences:MetricComparison[];summary:string }

export const HISTORICAL_START_YEAR=1950;
export const HISTORICAL_END_YEAR=2025;
export const MINIMUMS={hitterPlateAppearances:200,starterInnings:60,relieverInnings:30} as const;

type Definition={key:SeasonMetricKey;label:string;weight:number;format:MetricFormat};
const hitters:Definition[]=[
  {key:"age",label:"Age",weight:.35,format:"integer"},{key:"plateAppearances",label:"Plate appearances",weight:.45,format:"integer"},
  {key:"avg",label:"AVG",weight:.7,format:"rate-3"},{key:"obp",label:"OBP",weight:1.15,format:"rate-3"},{key:"slg",label:"SLG",weight:1,format:"rate-3"},
  {key:"ops",label:"OPS",weight:1.4,format:"rate-3"},{key:"homeRuns",label:"Home runs",weight:.55,format:"integer"},{key:"rbi",label:"RBI",weight:.35,format:"integer"},
  {key:"stolenBases",label:"Stolen bases",weight:.3,format:"integer"},{key:"walkRate",label:"BB%",weight:1,format:"percent"},{key:"strikeoutRate",label:"K%",weight:1,format:"percent"},
];
const pitchers:Definition[]=[
  {key:"age",label:"Age",weight:.3,format:"integer"},{key:"games",label:"Games",weight:.25,format:"integer"},{key:"starts",label:"Starts",weight:.45,format:"integer"},
  {key:"inningsPitched",label:"Innings pitched",weight:.8,format:"decimal-1"},{key:"era",label:"ERA",weight:1.4,format:"decimal-2"},{key:"whip",label:"WHIP",weight:1.15,format:"decimal-2"},
  {key:"strikeouts",label:"Strikeouts",weight:.7,format:"integer"},{key:"strikeoutRate",label:"K%",weight:1,format:"percent"},{key:"walkRate",label:"BB%",weight:1,format:"percent"},{key:"saves",label:"Saves",weight:.25,format:"integer"},
];

export function yearsForFilter(filter:HistoricalYearFilter,specific?:number):number[]{
  if(filter==="specific") return specific&&specific>=HISTORICAL_START_YEAR&&specific<=HISTORICAL_END_YEAR?[specific]:[];
  const ranges:Record<Exclude<HistoricalYearFilter,"specific">,[number,number]>={all:[HISTORICAL_START_YEAR,HISTORICAL_END_YEAR],"2020s":[2020,2025],"2010s":[2010,2019],"2000s":[2000,2009],"1990s":[1990,1999],"1980s":[1980,1989],earlier:[HISTORICAL_START_YEAR,1979]};
  const [start,end]=ranges[filter]; return Array.from({length:end-start+1},(_,index)=>start+index);
}
export function isEligibleSeason(s:PlayerSeason):boolean{
  if(s.role==="hitter") return (s.plateAppearances??0)>=MINIMUMS.hitterPlateAppearances;
  return (s.inningsPitched??0)>=(s.pitchingRole==="Reliever"?MINIMUMS.relieverInnings:MINIMUMS.starterInnings);
}
export function filterCompatibleSeasons(current:PlayerSeason,candidates:PlayerSeason[]):PlayerSeason[]{
  return candidates.filter(s=>s.role===current.role&&s.playerId!==current.playerId&&isEligibleSeason(s)&&(current.role!=="pitcher"||s.pitchingRole===current.pitchingRole));
}
const mean=(v:number[])=>v.reduce((a,b)=>a+b,0)/v.length;
export function compareAndRank(current:PlayerSeason,candidates:PlayerSeason[],careerByPlayer:Map<string,CareerSeries>,limit=3):SeasonComparison[]{
  const eligible=filterCompatibleSeasons(current,candidates), definitions=current.role==="hitter"?hitters:pitchers;
  const distributions=new Map<SeasonMetricKey,{mean:number;sd:number}>();
  for(const d of definitions){const values=eligible.map(s=>s[d.key]).filter((v):v is number=>typeof v==="number");if(values.length<2)continue;const m=mean(values);const sd=Math.sqrt(mean(values.map(v=>(v-m)**2)));if(sd>0)distributions.set(d.key,{mean:m,sd});}
  const comparisons=eligible.flatMap(historical=>{
    const metrics=definitions.flatMap(d=>{const a=current[d.key],b=historical[d.key],dist=distributions.get(d.key);if(typeof a!=="number"||typeof b!=="number"||!dist)return[];const normalizedDifference=Math.abs(a-b)/dist.sd;const closenessScore=Math.max(0,1-normalizedDifference/3);return[{...d,currentValue:a,historicalValue:b,normalizedDifference,closenessScore,closeness:(normalizedDifference<=.25?"very-close":normalizedDifference<=.65?"close":"different") as MetricComparison["closeness"]}];});
    if(metrics.length<5)return[];const weight=metrics.reduce((n,m)=>n+m.weight,0);const score=Math.round(metrics.reduce((n,m)=>n+m.closenessScore*m.weight,0)/weight*100);const ordered=[...metrics].sort((a,b)=>a.normalizedDifference-b.normalizedDifference);const strongest=ordered.slice(0,4),biggest=ordered.slice(-2).reverse();
    const summary=`These MLB seasons align most closely in ${strongest.map(m=>m.label).join(", ")}. Their largest standardized differences are ${biggest.map(m=>m.label).join(" and ")}. The comparison uses only available MLB-sourced metrics.`;
    return[{currentSeason:current,historicalSeason:historical,historicalCareer:careerByPlayer.get(historical.playerId)??emptyCareer(historical),similarityScore:score,metrics,strongestSimilarities:strongest,biggestDifferences:biggest,summary}];
  }).sort((a,b)=>(b.similarityScore??-1)-(a.similarityScore??-1));
  const seen=new Set<string>();return comparisons.filter(c=>!seen.has(c.historicalSeason.playerId)&&!!seen.add(c.historicalSeason.playerId)).slice(0,limit);
}
export function emptyCareer(s:PlayerSeason):CareerSeries{return{playerId:s.playerId,name:s.playerName,color:"#5ea9ff",metricLabel:s.role==="hitter"?"OPS":"ERA",lowerIsBetter:s.role==="pitcher",series:[]}}
export function formatSeasonMetric(metric:Pick<MetricComparison,"currentValue"|"format">,value=metric.currentValue):string{if(metric.format==="rate-3")return value.toFixed(3).replace(/^0/,"");if(metric.format==="decimal-1")return value.toFixed(1);if(metric.format==="decimal-2")return value.toFixed(2);if(metric.format==="percent")return`${value.toFixed(1)}%`;return Math.round(value).toString()}
