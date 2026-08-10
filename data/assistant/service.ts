import "server-only";
import { buildAssistantContext } from "./context";
import { buildDeterministicAnswer } from "./deterministic";
import { routeAssistantIntent } from "./intent";
import { getAssistantProvider, type AssistantProvider } from "./provider";
import type { AssistantAnswer, AssistantPlayerContext, AssistantRequest } from "./types";

const NEVER_LLM=new Set(["unsupported-game-level","unsupported-statcast","gem-score","career-history","season-comparison","historical-similarity","milb-development","age-level"]);
export async function answerAssistantRequest(request:AssistantRequest,dependencies?:{context?:AssistantPlayerContext|null;provider?:AssistantProvider}):Promise<AssistantAnswer>{
  const context=dependencies&&"context"in dependencies?dependencies.context:await buildAssistantContext(request.playerId,request.playerKind);if(!context)throw new Error("Player context was not found.");
  if(context.identity.officialId!==request.playerId||context.identity.kind!==request.playerKind)throw new Error("Player context does not match the requested profile.");
  const intent=routeAssistantIntent(request.question,request.history),draft=buildDeterministicAnswer(context,intent,request.question,request.history),provider=dependencies?.provider??getAssistantProvider();
  if(NEVER_LLM.has(intent)||!provider.isAvailable())return draft;
  try{const answer=await provider.generate({question:request.question,intent,context,deterministicDraft:draft.answer,history:request.history});return{...draft,answer,usedLlm:true}}catch{return draft}
}
