import { getHistoricalTrajectoryPool, type HistoricalTrajectory, type TrajectoryPlayer, type TrajectoryRole } from "./trajectory";

export type HistoricalYearFilter = "all" | "2020s" | "2010s" | "2000s" | "1990s" | "1980s" | "earlier" | "specific";
export type Closeness = "very-close" | "close" | "different";
export type SeasonMetricKey = "age" | "games" | "starts" | "plateAppearances" | "inningsPitched" | "war" | "avg" | "obp" | "slg" | "ops" | "opsPlus" | "homeRuns" | "rbi" | "stolenBases" | "walkRate" | "strikeoutRate" | "defensiveValue" | "era" | "eraPlus" | "fip" | "whip" | "strikeouts" | "saves";

export interface PlayerSeason {
  playerId: string;
  playerName: string;
  team: string | null;
  position: string;
  role: TrajectoryRole;
  season: number;
  age: number;
  games: number | null;
  starts: number | null;
  plateAppearances: number | null;
  inningsPitched: number | null;
  war: number | null;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  opsPlus: number | null;
  homeRuns: number | null;
  rbi: number | null;
  stolenBases: number | null;
  walkRate: number | null;
  strikeoutRate: number | null;
  defensiveValue: number | null;
  era: number | null;
  eraPlus: number | null;
  fip: number | null;
  whip: number | null;
  strikeouts: number | null;
  saves: number | null;
  pitchingRole: "Starter" | "Reliever" | null;
  dataQuality: "demo";
}

export interface MetricComparison {
  key: SeasonMetricKey;
  label: string;
  currentValue: number;
  historicalValue: number;
  difference: number;
  closenessScore: number;
  closeness: Closeness;
  format: "integer" | "decimal-1" | "decimal-2" | "rate-3" | "percent";
}

export interface SeasonComparison {
  currentSeason: PlayerSeason;
  historicalSeason: PlayerSeason;
  historicalCareer: HistoricalTrajectory;
  similarityScore: number;
  metrics: MetricComparison[];
  strongestSimilarities: MetricComparison[];
  biggestDifferences: MetricComparison[];
  summary: string;
}

interface MetricDefinition {
  key: SeasonMetricKey;
  label: string;
  scale: number;
  weight: number;
  format: MetricComparison["format"];
}

const hitterMetrics: MetricDefinition[] = [
  {key:"age",label:"Age",scale:5,weight:.35,format:"integer"},{key:"games",label:"Games",scale:45,weight:.3,format:"integer"},{key:"plateAppearances",label:"Plate appearances",scale:180,weight:.45,format:"integer"},{key:"war",label:"WAR",scale:3,weight:1.4,format:"decimal-1"},{key:"avg",label:"AVG",scale:.06,weight:.8,format:"rate-3"},{key:"obp",label:"OBP",scale:.07,weight:1.1,format:"rate-3"},{key:"slg",label:"SLG",scale:.14,weight:1,format:"rate-3"},{key:"ops",label:"OPS",scale:.18,weight:1.1,format:"rate-3"},{key:"opsPlus",label:"OPS+",scale:40,weight:1.4,format:"integer"},{key:"homeRuns",label:"Home runs",scale:22,weight:.55,format:"integer"},{key:"rbi",label:"RBI",scale:40,weight:.45,format:"integer"},{key:"stolenBases",label:"Stolen bases",scale:22,weight:.35,format:"integer"},{key:"walkRate",label:"BB%",scale:7,weight:1,format:"percent"},{key:"strikeoutRate",label:"K%",scale:9,weight:1,format:"percent"},{key:"defensiveValue",label:"Defensive value",scale:10,weight:.45,format:"decimal-1"},
];

const pitcherMetrics: MetricDefinition[] = [
  {key:"age",label:"Age",scale:5,weight:.3,format:"integer"},{key:"games",label:"Games",scale:25,weight:.3,format:"integer"},{key:"starts",label:"Starts",scale:15,weight:.35,format:"integer"},{key:"inningsPitched",label:"Innings pitched",scale:65,weight:.8,format:"decimal-1"},{key:"war",label:"WAR",scale:3,weight:1.4,format:"decimal-1"},{key:"era",label:"ERA",scale:1.5,weight:1.3,format:"decimal-2"},{key:"eraPlus",label:"ERA+",scale:45,weight:1.3,format:"integer"},{key:"fip",label:"FIP",scale:1.4,weight:1.1,format:"decimal-2"},{key:"whip",label:"WHIP",scale:.32,weight:1.1,format:"decimal-2"},{key:"strikeouts",label:"Strikeouts",scale:85,weight:.75,format:"integer"},{key:"strikeoutRate",label:"K%",scale:9,weight:1,format:"percent"},{key:"walkRate",label:"BB%",scale:5,weight:1,format:"percent"},{key:"saves",label:"Saves",scale:25,weight:.35,format:"integer"},
];

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const hash = (value: string) => Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
const jitter = (seed: string, amplitude: number) => (((hash(seed) % 101) / 100) * 2 - 1) * amplitude;
const round = (value: number, decimals = 0) => Number(value.toFixed(decimals));

function demoSeason(playerId: string, playerName: string, team: string | null, position: string, role: TrajectoryRole, season: number, age: number, annualWar: number): PlayerSeason {
  const seed = `${playerId}-${season}`;
  if (role === "hitter") {
    const games = clamp(Math.round(112 + annualWar * 6 + jitter(seed+"g",12)), 55, 162);
    const avg = round(clamp(.225 + annualWar * .009 + jitter(seed+"a",.018), .190, .340),3);
    const walkRate = round(clamp(6.5 + annualWar * .65 + jitter(seed+"b",2.2),3,20),1);
    const strikeoutRate = round(clamp(24 - annualWar * .45 + jitter(seed+"k",3.5),10,36),1);
    const obp = round(clamp(avg + .052 + walkRate / 240, .250, .455),3);
    const slg = round(clamp(.350 + annualWar * .042 + jitter(seed+"s",.045),.290,.700),3);
    const ops = round(obp + slg,3);
    return { playerId,playerName,team,position,role,season,age,games,starts:null,plateAppearances:Math.round(games*(3.75+jitter(seed+"p",.2))),inningsPitched:null,war:round(annualWar,1),avg,obp,slg,ops,opsPlus:Math.round(78+(ops-.650)*180),homeRuns:clamp(Math.round(6+annualWar*4.8+jitter(seed+"h",5)),0,60),rbi:clamp(Math.round(30+annualWar*10+jitter(seed+"r",12)),10,145),stolenBases:clamp(Math.round((position==="SS"||position==="CF"||position==="OF"||position==="RF"||position==="LF"?8:2)+jitter(seed+"sb",9)),0,60),walkRate,strikeoutRate,defensiveValue:position==="DH"?null:round(clamp(jitter(seed+"d",8)+annualWar*.35,-15,20),1),era:null,eraPlus:null,fip:null,whip:null,strikeouts:null,saves:null,pitchingRole:null,dataQuality:"demo" };
  }
  const reliever = position === "RP";
  const games = reliever ? clamp(Math.round(52+jitter(seed+"g",12)),25,75) : clamp(Math.round(25+annualWar*.9+jitter(seed+"g",4)),12,35);
  const starts = reliever ? 0 : clamp(Math.round(games-jitter(seed+"st",2)),0,games);
  const inningsPitched = round(reliever ? games*(1+jitter(seed+"ip",.08)) : starts*(5.25+jitter(seed+"ip",.45)),1);
  const era = round(clamp(4.75-annualWar*.38+jitter(seed+"e",.45),1.25,6.25),2);
  const strikeoutRate = round(clamp(20+annualWar*1.25+jitter(seed+"k",3),12,42),1);
  const walkRate = round(clamp(9-annualWar*.35+jitter(seed+"b",1.8),3,15),1);
  return { playerId,playerName,team,position,role,season,age,games,starts,plateAppearances:null,inningsPitched,war:round(annualWar,1),avg:null,obp:null,slg:null,ops:null,opsPlus:null,homeRuns:null,rbi:null,stolenBases:null,walkRate,strikeoutRate,defensiveValue:null,era,eraPlus:Math.round(420/era*100/100),fip:round(clamp(era+jitter(seed+"f",.4),1.4,6.4),2),whip:round(clamp(.83+era*.095+jitter(seed+"w",.08),.75,1.65),2),strikeouts:Math.round(inningsPitched*strikeoutRate/24),saves:reliever?clamp(Math.round(20+annualWar*3+jitter(seed+"sv",10)),0,55):0,pitchingRole:reliever?"Reliever":"Starter",dataQuality:"demo" };
}

export function buildCurrentPlayerSeasons(player: TrajectoryPlayer): PlayerSeason[] {
  return player.series.map((point,index) => demoSeason(player.id,player.name,player.team,player.position,player.role,2026-(player.age-point.age),point.age,point.war-(player.series[index-1]?.war??0)));
}

export function buildHistoricalSeasons(role: TrajectoryRole): { season: PlayerSeason; career: HistoricalTrajectory }[] {
  return getHistoricalTrajectoryPool(role).flatMap(player => {
    const startYear = Number(player.era.slice(0,4));
    const endYear = Number(player.era.slice(-4));
    const playerId = player.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const careerLength = Math.max(1,endYear-startYear);
    const expandedSeries = Array.from({length:careerLength+1},(_,index)=>{
      const progress = index/careerLength*(player.series.length-1);
      const lowerIndex = Math.floor(progress);
      const upperIndex = Math.min(player.series.length-1,Math.ceil(progress));
      const fraction = progress-lowerIndex;
      const cumulativeWar = player.series[lowerIndex].war+(player.series[upperIndex].war-player.series[lowerIndex].war)*fraction;
      return {age:player.series[0].age+index,war:round(cumulativeWar,1)};
    });
    const expandedCareer: HistoricalTrajectory = {...player,series:expandedSeries};
    return expandedSeries.map((point,index) => ({ season: demoSeason(playerId,player.name,null,player.position,role,startYear+index,point.age,point.war-(expandedSeries[index-1]?.war??0)), career:expandedCareer }));
  });
}

export function filterHistoricalSeasons<T extends { season: PlayerSeason }>(seasons: T[], filter: HistoricalYearFilter, specificYear?: number): T[] {
  if (filter === "all") return seasons;
  if (filter === "specific") return Number.isFinite(specificYear) ? seasons.filter(item=>item.season.season===specificYear) : [];
  if (filter === "earlier") return seasons.filter(item=>item.season.season<1980);
  const decade = Number(filter.slice(0,4));
  return seasons.filter(item=>item.season.season>=decade&&item.season.season<=decade+9);
}

export function compareSeasons(current: PlayerSeason, historical: PlayerSeason, historicalCareer: HistoricalTrajectory): SeasonComparison {
  const definitions = current.role === "hitter" ? hitterMetrics : pitcherMetrics;
  const metrics = definitions.flatMap(definition => {
    const currentValue = current[definition.key];
    const historicalValue = historical[definition.key];
    if (typeof currentValue !== "number" || typeof historicalValue !== "number") return [];
    const difference = Math.abs(currentValue-historicalValue);
    const closenessScore = clamp(1-difference/definition.scale,0,1);
    const closeness: Closeness = closenessScore>=.88?"very-close":closenessScore>=.68?"close":"different";
    return [{ key:definition.key,label:definition.label,currentValue,historicalValue,difference,closenessScore,closeness,format:definition.format,weight:definition.weight }];
  });
  const weightedTotal = metrics.reduce((total,metric)=>total+metric.closenessScore*metric.weight,0);
  const totalWeight = metrics.reduce((total,metric)=>total+metric.weight,0);
  const similarityScore = totalWeight ? Math.round(weightedTotal/totalWeight*100) : 0;
  const ordered = [...metrics].sort((a,b)=>b.closenessScore-a.closenessScore);
  const strongestSimilarities = ordered.slice(0,4);
  const biggestDifferences = ordered.slice(-2).reverse();
  const strongestText = strongestSimilarities.map(metric=>metric.label).join(", ");
  const differencesText = biggestDifferences.map(metric=>metric.label).join(" and ");
  const roleText = current.role === "pitcher" && current.pitchingRole === historical.pitchingRole && current.pitchingRole ? ` Both seasons use a ${current.pitchingRole.toLowerCase()} role.` : "";
  const summary = `The stored demo metrics align most closely in ${strongestText}. The largest measured differences are ${differencesText}.${roleText}`;
  return {currentSeason:current,historicalSeason:historical,historicalCareer,similarityScore,metrics,strongestSimilarities,biggestDifferences,summary};
}

export function findSeasonComparisons(current: PlayerSeason, filter: HistoricalYearFilter, specificYear?: number, limit=3): SeasonComparison[] {
  const candidates = filterHistoricalSeasons(buildHistoricalSeasons(current.role),filter,specificYear).map(item=>compareSeasons(current,item.season,item.career)).sort((a,b)=>b.similarityScore-a.similarityScore);
  const seen = new Set<string>();
  return candidates.filter(comparison=>{if(seen.has(comparison.historicalSeason.playerId))return false;seen.add(comparison.historicalSeason.playerId);return true}).slice(0,limit);
}

export function formatSeasonMetric(metric: Pick<MetricComparison,"currentValue"|"format">, value=metric.currentValue): string {
  if (metric.format === "rate-3") return value.toFixed(3).replace(/^0/,"");
  if (metric.format === "decimal-1") return value.toFixed(1);
  if (metric.format === "decimal-2") return value.toFixed(2);
  if (metric.format === "percent") return `${value.toFixed(1)}%`;
  return Math.round(value).toString();
}
