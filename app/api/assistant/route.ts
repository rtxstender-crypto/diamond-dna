import { NextRequest, NextResponse } from "next/server";
import { answerAssistantRequest } from "@/data/assistant/service";
import { consumeRateLimit } from "@/data/assistant/rate-limit";
import { AssistantRequestError, parseAssistantRequest, readAssistantJson } from "@/data/assistant/validation";
import { logServerError } from "@/data/server-log";

export async function POST(request:NextRequest){
  const client=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??request.headers.get("x-real-ip")??"local",limit=consumeRateLimit(client);
  if(!limit.allowed)return NextResponse.json({error:"Ask DiamondDNA rate limit reached. Please wait before asking again."},{status:429,headers:{"retry-after":String(limit.retryAfter)}});
  try{const input=parseAssistantRequest(await readAssistantJson(request));const result=await answerAssistantRequest(input);return NextResponse.json(result,{headers:{"cache-control":"no-store","x-ratelimit-remaining":String(limit.remaining)}})}catch(error){
    if(error instanceof AssistantRequestError)return NextResponse.json({error:error.message},{status:error.status});
    if(error instanceof Error&&error.message==="Player context was not found.")return NextResponse.json({error:error.message},{status:404});
    logServerError("assistant_request_failed",error);return NextResponse.json({error:"Ask DiamondDNA is temporarily unavailable."},{status:503});
  }
}
