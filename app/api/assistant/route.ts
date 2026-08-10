import { NextRequest, NextResponse } from "next/server";
import { answerAssistantRequest } from "@/data/assistant/service";
import { consumeRateLimit } from "@/data/assistant/rate-limit";
import { AssistantRequestError, parseAssistantRequest } from "@/data/assistant/validation";

export async function POST(request:NextRequest){
  const client=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??request.headers.get("x-real-ip")??"local",limit=consumeRateLimit(client);
  if(!limit.allowed)return NextResponse.json({error:"Ask DiamondDNA rate limit reached. Please wait before asking again."},{status:429,headers:{"retry-after":String(limit.retryAfter)}});
  try{const size=Number(request.headers.get("content-length")??0);if(size>20_000)throw new AssistantRequestError("Request is too large.",413);const input=parseAssistantRequest(await request.json());const result=await answerAssistantRequest(input);return NextResponse.json(result,{headers:{"x-ratelimit-remaining":String(limit.remaining)}})}catch(error){
    if(error instanceof AssistantRequestError)return NextResponse.json({error:error.message},{status:error.status});
    return NextResponse.json({error:error instanceof SyntaxError?"Malformed JSON request.":error instanceof Error&&error.message==="Player context was not found."?error.message:"Ask DiamondDNA is temporarily unavailable."},{status:error instanceof SyntaxError?400:error instanceof Error&&error.message==="Player context was not found."?404:503});
  }
}
