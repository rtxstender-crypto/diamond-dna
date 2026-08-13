import { NextRequest,NextResponse } from "next/server";
import { getPlayerDataProvider } from "@/data/player-service";
import { fetchProspectDataset } from "@/data/providers/mlb-milb-provider";
import { mlbInput,prospectInput } from "@/data/trade-value/adapters";
import { calculateTradeValue } from "@/data/trade-value/model";
import { MLB_TEAMS } from "@/data/trade-value/teams";
import type { TradeAssetInput } from "@/data/trade-value/types";

export async function GET(request:NextRequest){const teamId=Number(request.nextUrl.searchParams.get("teamId")),query=(request.nextUrl.searchParams.get("q")??"").trim().slice(0,80);if(!Number.isInteger(teamId)||!MLB_TEAMS.some(team=>team.id===teamId))return NextResponse.json({error:"Invalid team ID."},{status:400});if(query.length<2)return NextResponse.json({players:[]});try{const[mlb,milb]=await Promise.all([getPlayerDataProvider().listPlayers({search:query}).catch(()=>[]),fetchProspectDataset().catch(()=>null)]),candidates=[...mlb.map(mlbInput),...(milb?.players.filter(player=>!player.mlbConnected&&player.organizationId===teamId&&player.name.toLowerCase().includes(query.toLowerCase())).map(prospectInput)??[])].filter((input):input is TradeAssetInput=>input!==null&&input.teamId===teamId),byPlayerId=new Map<number,TradeAssetInput>();for(const input of candidates){const existing=byPlayerId.get(input.id);if(!existing||input.kind==="mlb")byPlayerId.set(input.id,input)}const inputs=[...byPlayerId.values()].slice(0,20);return NextResponse.json({players:inputs.map(input=>({input,value:calculateTradeValue(input)}))},{headers:{"cache-control":"private, max-age=30"}})}catch{return NextResponse.json({error:"Player search is temporarily unavailable."},{status:503})}}
