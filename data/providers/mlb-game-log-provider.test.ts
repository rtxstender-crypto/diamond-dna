import { describe,expect,it } from "vitest";
import { parseGameLogPayload } from "./mlb-game-log-provider";

describe("MLB game-log provider parsing",()=>{
  it("maps official IDs and derives singles only from complete hit components",()=>{const games=parseGameLogPayload({stats:[{splits:[{date:"2026-04-01",isHome:true,opponent:{id:2,name:"Visitors"},game:{gamePk:999},stat:{atBats:5,plateAppearances:5,hits:4,doubles:1,triples:1,homeRuns:1,rbi:5,runs:2,baseOnBalls:0,strikeOuts:1,stolenBases:1}}]}]},1,"position-player",2026,"2026-08-11T00:00:00Z");expect(games[0]).toMatchObject({playerId:1,gameId:999,opponent:"Visitors",homeAway:"home",stats:{singles:1,hits:4}})});
  it("rejects malformed splits and keeps unsupported values null",()=>{expect(parseGameLogPayload({stats:[{splits:[null,{date:"bad"},{date:"2026-04-01",game:{gamePk:44},stat:{hits:"oops"}}]}]},1,"position-player",2026,"now")).toMatchObject([{gameId:44,finalScore:null,stats:{hits:null,singles:null,grandSlams:null}}]);expect(parseGameLogPayload({stats:"bad"},1,"pitcher",2026,"now")).toEqual([])});
});
