import type { AssistantHistoryItem, AssistantPlayerKind, AssistantRequest } from "./types";

export const MAX_QUESTION_LENGTH=500;
export const MAX_HISTORY_ITEMS=8;
export const MAX_REQUEST_BYTES=20_000;

export class AssistantRequestError extends Error { constructor(message:string,public status=400){super(message)} }

export async function readAssistantJson(request:Request):Promise<unknown>{
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw new AssistantRequestError("Content-Type must be application/json.",415);
  if(!request.body)throw new AssistantRequestError("Malformed request.");
  const reader=request.body.getReader(),decoder=new TextDecoder();let bytes=0,text="";
  while(true){const{done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>MAX_REQUEST_BYTES){await reader.cancel();throw new AssistantRequestError("Request is too large.",413)}text+=decoder.decode(value,{stream:true})}
  text+=decoder.decode();try{return JSON.parse(text)}catch{throw new AssistantRequestError("Malformed JSON request.")}
}

export function parseAssistantRequest(value:unknown):AssistantRequest{
  if(typeof value!=="object"||value===null||Array.isArray(value))throw new AssistantRequestError("Malformed request.");
  const body=value as Record<string,unknown>,playerId=body.playerId,playerKind=body.playerKind,question=body.question,history=body.history;
  if(typeof playerId!=="number"||!Number.isInteger(playerId)||playerId<=0)throw new AssistantRequestError("A valid official player ID is required.");
  if(playerKind!=="mlb"&&playerKind!=="milb")throw new AssistantRequestError("Player type must be mlb or milb.");
  if(typeof question!=="string"||!question.trim())throw new AssistantRequestError("Enter a question about this player.");
  if(question.length>MAX_QUESTION_LENGTH)throw new AssistantRequestError(`Questions are limited to ${MAX_QUESTION_LENGTH} characters.`,413);
  const cleanHistory:AssistantHistoryItem[]=Array.isArray(history)?history.slice(-MAX_HISTORY_ITEMS).flatMap(item=>{
    if(typeof item!=="object"||item===null||Array.isArray(item))return[];const row=item as Record<string,unknown>;
    if((row.role!=="user"&&row.role!=="assistant")||typeof row.content!=="string")return[];
    return[{role:row.role,content:row.content.slice(0,800),intent:typeof row.intent==="string"?row.intent as AssistantHistoryItem["intent"]:undefined}];
  }):[];
  return{playerId,playerKind:playerKind as AssistantPlayerKind,question:question.trim(),history:cleanHistory};
}
