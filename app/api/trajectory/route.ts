import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/data/assistant/rate-limit";
import { compareAndRank } from "@/data/trajectory-comparison";
import { fetchCareer, fetchHistoricalPool, resolvePlayer, toCareerSeries } from "@/data/providers/mlb-historical-provider";
import { logServerError } from "@/data/server-log";
import { parseTrajectoryRequest, TrajectoryRequestError } from "@/data/trajectory-request";

const TRAJECTORY_RATE_LIMIT={requests:6,windowMs:60_000};
export async function GET(request:NextRequest){
  const client=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??request.headers.get("x-real-ip")??"local",limit=consumeRateLimit(`trajectory:${client}`,Date.now(),TRAJECTORY_RATE_LIMIT);
  if(!limit.allowed)return NextResponse.json({error:"Career comparison rate limit reached. Please wait before trying again."},{status:429,headers:{"retry-after":String(limit.retryAfter)}});
  try{
    const query=parseTrajectoryRequest(request.nextUrl.searchParams),identity=await resolvePlayer(query.name),rawCareer=await fetchCareer(identity.id,query.role),currentCareer=rawCareer.map(season=>({...season,position:identity.position})),current=query.season?currentCareer.find(season=>season.season===query.season):currentCareer.at(-1);
    if(!current)return NextResponse.json({error:"No MLB season data is available for this player."},{status:404});
    const pool=await fetchHistoricalPool(query.role,query.filter,query.specificYear),preliminary=compareAndRank(current,pool,new Map(),3),colors=["#c8f75b","#5ea9ff","#f5a75b"],careerPairs=await Promise.all(preliminary.map(async(comparison,index)=>[comparison.historicalSeason.playerId,toCareerSeries(await fetchCareer(comparison.historicalSeason.playerId,query.role),colors[index])] as const)),comparisons=compareAndRank(current,pool,new Map(careerPairs),3);
    return NextResponse.json({source:"MLB Stats API",coverage:"1950–2025",identity,currentCareer,currentCareerSeries:toCareerSeries(currentCareer,"#d3ff62"),currentSeason:current,comparisons,candidateCount:pool.length},{headers:{"cache-control":"private, no-store","x-ratelimit-remaining":String(limit.remaining)}});
  }catch(error){
    if(error instanceof TrajectoryRequestError)return NextResponse.json({error:error.message},{status:error.status});
    logServerError("trajectory_request_failed",error);return NextResponse.json({error:"Career comparison data is temporarily unavailable. Please try again shortly."},{status:502});
  }
}
