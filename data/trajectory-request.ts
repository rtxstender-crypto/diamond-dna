import { HISTORICAL_END_YEAR, HISTORICAL_START_YEAR, type HistoricalYearFilter, type TrajectoryRole } from "./trajectory-comparison";

export class TrajectoryRequestError extends Error{constructor(message:string,public status=400){super(message)}}
const filters=new Set<HistoricalYearFilter>(["all","2020s","2010s","2000s","1990s","1980s","earlier","specific"]);
export interface TrajectoryRequest{name:string;role:TrajectoryRole;filter:HistoricalYearFilter;specificYear?:number;season?:number}

export function parseTrajectoryRequest(params:URLSearchParams):TrajectoryRequest{
  const name=params.get("name")?.trim()??"",role=params.get("role"),filter=params.get("filter")??"2020s";
  if(!name||name.length>100)throw new TrajectoryRequestError("A valid player name is required.");
  if(role!=="hitter"&&role!=="pitcher")throw new TrajectoryRequestError("A valid player role is required.");
  if(!filters.has(filter as HistoricalYearFilter))throw new TrajectoryRequestError("A valid historical range is required.");
  const typedFilter=filter as HistoricalYearFilter,yearText=params.get("year"),seasonText=params.get("season");
  const specificYear=yearText===null?undefined:Number(yearText),season=seasonText===null?undefined:Number(seasonText),maxSeason=new Date().getFullYear()+1;
  if(typedFilter==="specific"&&(!Number.isInteger(specificYear)||specificYear!<HISTORICAL_START_YEAR||specificYear!>HISTORICAL_END_YEAR))throw new TrajectoryRequestError(`Historical year must be ${HISTORICAL_START_YEAR}–${HISTORICAL_END_YEAR}.`);
  if(season!==undefined&&(!Number.isInteger(season)||season<1876||season>maxSeason))throw new TrajectoryRequestError("A valid MLB season is required.");
  return{name,role,filter:typedFilter,specificYear,season};
}
