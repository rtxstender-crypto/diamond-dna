import type { AssistantAnswer, AssistantPlayerContext } from "./types";
import type { CareerHigh, MilestoneEvent, PlayerGameLog } from "../game-history/types";

const date=(value:string)=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`));
const opponent=(game:PlayerGameLog)=>game.opponent?`${game.homeAway==="away"?"at":"vs."} ${game.opponent}`:"vs. N/A";
const occurrence=(game:PlayerGameLog)=>`${date(game.date)} ${opponent(game)} (game ${game.gameId})`;
const highLabels:Record<CareerHigh["metric"],string>={rbi:"RBI",homeRuns:"home runs",hits:"hits",stolenBases:"stolen bases",strikeouts:"strikeouts",inningsPitched:"innings pitched",scorelessOuting:"scoreless innings"};
function result(context:AssistantPlayerContext,answer:string,games:PlayerGameLog[]=[]):AssistantAnswer{return{answer,intent:"game-history",evidence:games.flatMap((g,i)=>[{label:i?"Tied occurrence":"Official game",value:occurrence(g),note:`MLB player ${g.playerId} · game ${g.gameId}`}]),sourceLabel:"MLB Stats API gameLog",freshness:context.gameHistory?.refreshedAt??null,usedLlm:false,providerAvailable:Boolean(process.env.DIAMONDDNA_ASSISTANT_API_KEY&&process.env.DIAMONDDNA_ASSISTANT_MODEL)}}
export function answerGameHistory(context:AssistantPlayerContext,question:string):AssistantAnswer{
  const history=context.gameHistory,player=context.identity.name;if(context.identity.kind!=="mlb")return result(context,`Verified MLB game logs are not available for this MiLB profile, so DiamondDNA cannot answer that without guessing.`);
  if(!history||!history.games.length)return result(context,`DiamondDNA could not retrieve verified game-log data for ${player}. It will not answer this game-level question from model memory.`);
  const q=question.toLowerCase();let events:MilestoneEvent[]=[];
  if(/cycle/.test(q))events=history.milestones.filter(m=>m.type==="cycle");
  else if(/perfect game/.test(q))events=history.milestones.filter(m=>m.type==="perfect-game");
  else if(/no.?hitter/.test(q))events=history.milestones.filter(m=>m.type==="no-hitter");
  else if(/shutout/.test(q))events=history.milestones.filter(m=>m.type==="shutout");
  else if(/complete game/.test(q))events=history.milestones.filter(m=>m.type==="complete-game");
  else if(/3.?hom|three.?hom/.test(q))events=history.milestones.filter(m=>m.type==="multi-hr"&&(m.value??0)>=3);
  else if(/2 home runs|2.?hom|two.?hom/.test(q))events=history.milestones.filter(m=>m.type==="multi-hr"&&(m.value??0)>=2);
  if(events.length){const first=events[0];return result(context,`${player} ${first.label.toLowerCase()} on ${occurrence(first.game)}.${events.length>1?` DiamondDNA found ${events.length} verified matching games.`:""}`,[first.game,...events.slice(1).map(e=>e.game)]);}
  if(/cycle|perfect game|no.?hitter|shutout|complete game|\d.?hom/.test(q)){const label=/cycle/.test(q)?"hit for the cycle":/perfect/.test(q)?"throw an officially verified perfect game":/no.?hitter/.test(q)?"throw an officially verified no-hitter":/shutout/.test(q)?"throw a shutout":/complete/.test(q)?"throw a complete game":"record that multi-home-run milestone";return result(context,`No verified MLB game log in DiamondDNA's available history shows that ${player} ${label}. This is not a claim about games absent from the source.`);}
  const metric:CareerHigh["metric"]|null=/rbi/.test(q)?"rbi":/home run|homer/.test(q)?"homeRuns":/stolen base/.test(q)?"stolenBases":/strikeout/.test(q)?"strikeouts":/scoreless/.test(q)?"scorelessOuting":/innings pitched/.test(q)?"inningsPitched":/hit/.test(q)?"hits":null;
  if(metric){const high=history.careerHighs.find(h=>h.metric===metric);if(!high)return result(context,`The verified game logs do not contain the values needed to calculate ${player}'s career high in ${highLabels[metric]}.`);return result(context,`${player}'s verified career high is ${high.value} ${highLabels[metric]} in one game. ${high.occurrences.length>1?`That high is tied across ${high.occurrences.length} games.`:""}`.trim(),high.occurrences);}
  if(/best|biggest/.test(q)){const best=history.bestGame;if(!best)return result(context,`The verified game logs do not contain enough statistics to score ${player}'s best game.`);return result(context,`By DiamondDNA's game-performance formula, ${player}'s best game was ${occurrence(best.game)}, with a score of ${best.score.toFixed(1)}. Formula: ${best.formula}.`,[best.game]);}
  const notable=history.milestones.slice(0,8);if(notable.length)return result(context,`DiamondDNA found ${history.milestones.length} verified notable game milestone${history.milestones.length===1?"":"s"} for ${player}. The earliest was ${notable[0].label.toLowerCase()} on ${occurrence(notable[0].game)}.`,notable.map(m=>m.game));
  return result(context,`DiamondDNA has verified game logs for ${player}, but no supported notable milestone matches this question.`);
}
