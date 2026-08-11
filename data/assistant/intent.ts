import type { AssistantHistoryItem, AssistantIntent } from "./types";

type IntentRule = { intent: AssistantIntent; concepts: RegExp[]; minimum: number };
const rules: IntentRule[] = [
  { intent:"game-history",minimum:1,concepts:[/\b(game|box score|cycle|perfect game|no.?hitter|shutout|complete game|milestone|single.game|career high|best offensive|biggest rbi|\d+.homer|home runs? in one game|strikeouts? in one game|scoreless outing|what date)\b/i] },
  { intent:"unsupported-statcast",minimum:1,concepts:[/\b(statcast|exit velocity|launch angle|barrel|spin rate|pitch velocity|hard.hit|sprint speed)\b/i] },
  { intent:"gem-score",minimum:1,concepts:[/\bgem score\b/i,/\bperformance score\b/i,/\bage.?upside\b/i] },
  { intent:"historical-similarity",minimum:1,concepts:[/\b(similar|comparison|compare|historical match|trajectory)\b/i] },
  { intent:"milb-development",minimum:1,concepts:[/\b(minors|minor league|progress|development path|promotion|level.*best|best level)\b/i] },
  { intent:"age-level",minimum:1,concepts:[/\b(age.*level|young.*level|old.*level|relative.*level)\b/i] },
  { intent:"season-comparison",minimum:1,concepts:[/\b(better|worse|difference|changed|change|versus|vs\.?|than)\b/i] },
  { intent:"career-history",minimum:1,concepts:[/\b(best season|career|last \d+ seasons|season history|year by year)\b/i] },
  { intent:"strengths",minimum:1,concepts:[/\b(strength|best skill|does .* well|standout)\b/i] },
  { intent:"weaknesses",minimum:1,concepts:[/\b(weakness|struggle|concern|holds .* back|needs? improvement)\b/i] },
  { intent:"current-season",minimum:1,concepts:[/\b(this season|current season|how is .* doing|season summary|summarize (his|her|their|the) season)\b/i] },
  { intent:"overview",minimum:1,concepts:[/\b(summarize|overview|tell me about|who is)\b/i] },
];

const careerMarker=/\b(career(?:\s+wise)?|all[\s-]?time)\b/i;
const careerStat=/\b(HR|home\s*runs?|homers?|H|hits?|RBI|runs?\s+batted\s+in|SB|stolen\s+bases?|BB|walks?|AVG|batting\s+average|OBP|on[\s-]?base\s+percentage|SLG|slugging(?:\s+percentage)?|OPS|games?(?:\s+played)?|PA|plate\s+appearances?|AB|at[\s-]?bats?|runs?|doubles?|triples?|hit\s+by\s+pitches?|sacrifice\s+flies|IP|innings?(?:\s+pitched)?|K|strikeouts?|wins?|losses?|earned\s+runs?|ERA|earned\s+run\s+average|WHIP|saves?|hits?\s+allowed|home\s*runs?\s+allowed)\b/i;
const nonTotalCareer=/\b(career\s+high|best\s+season|single[\s-]?game|in\s+(?:one|a)\s+game)\b/i;

export function routeAssistantIntent(question:string,history:AssistantHistoryItem[]=[]):AssistantIntent{
  const normalized=question.trim();
  if(careerMarker.test(normalized)&&careerStat.test(normalized)&&!nonTotalCareer.test(normalized))return"career-stat";
  for(const rule of rules){if(rule.concepts.filter(pattern=>pattern.test(normalized)).length>=rule.minimum)return rule.intent;}
  const followUp=/^(how|why|what|and|was|is|did)\b/i.test(normalized)&&normalized.split(/\s+/).length<16;
  if(followUp){const prior=[...history].reverse().find(item=>item.role==="assistant"&&item.intent)?.intent;if(prior)return prior;}
  return "unknown";
}
