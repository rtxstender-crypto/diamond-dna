import { MLB_TEAMS } from "@/data/trade-value/teams";
import type { PackageStyle,TradeRequestIntent } from "./types";
const aliases:Record<string,string>={"red sox":"BOS","white sox":"CWS","yankees":"NYY","mets":"NYM","cubs":"CHC","reds":"CIN","dodgers":"LAD","giants":"SF","padres":"SD","d-backs":"AZ","diamondbacks":"AZ"};
const targetPattern=/(?:trade for|get|acquire|for)\s+([A-Z][A-Za-z.'-]+(?:\s+(?:[A-Z][A-Za-z.'-]+|de|del|la|van)){1,4})(?=[!?]|\s+(?:without|but|and don't|and do not)|$)/;
const exclusionPattern=/(?:don't include|do not include|without|don't trade)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,2})(?=[.!?]|$)/gi;
export function parseTradeRequest(question:string,history=""):TradeRequestIntent{
  const text=`${history} ${question}`.toLowerCase();
  const team=MLB_TEAMS.find(t=>text.includes(t.name.toLowerCase())||new RegExp(`\\b${t.abbreviation.toLowerCase()}\\b`).test(text)||Object.entries(aliases).some(([name,abbr])=>abbr===t.abbreviation&&text.includes(name)));
  const targetMatch=question.match(targetPattern),exclude=[...question.matchAll(exclusionPattern)].map(m=>m[1].replace(/[.!?]+$/,"").trim()),sizeMatch=question.match(/\b([1-8]|one|two|three|four|five|six|seven|eight)[ -]player/i);
  const words:Record<string,number>={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8},style:PackageStyle=/prospect.?heavy/i.test(text)?"prospect-heavy":/mlb.?ready|win.?now/i.test(text)?"mlb-ready":/cheapest|smallest/i.test(text)?"cheapest":"balanced",offers=/three (?:different )?offers/i.test(text)?3:/two (?:different )?offers/i.test(text)?2:1;
  return{acquiringTeamId:team?.id??null,targetName:targetMatch?.[1]?.replace(/[.!?]+$/,"").trim()??null,excludedNames:exclude,packageSize:sizeMatch?(Number(sizeMatch[1])||words[sizeMatch[1].toLowerCase()]):null,style,offerCount:offers};
}
