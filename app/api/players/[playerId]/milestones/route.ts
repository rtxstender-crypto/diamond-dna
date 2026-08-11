import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/data/player-index-service";
import { mlbGameLogProvider } from "@/data/providers/mlb-game-log-provider";

export async function GET(_request:Request,{params}:{params:Promise<{playerId:string}>}){
  const{playerId}=await params,id=Number(playerId);if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:"Invalid player ID."},{status:400});
  const profile=await getPlayerProfile(id);if(!profile)return NextResponse.json({error:"Player not found."},{status:404});
  try{const history=await mlbGameLogProvider.getCareer(id,profile.identity.role,profile.career.map(s=>s.season));return NextResponse.json(history,{headers:{"Cache-Control":"private, max-age=0, must-revalidate"}})}catch{return NextResponse.json({error:"Verified game logs are temporarily unavailable."},{status:503})}
}
