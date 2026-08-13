import { describe, expect, it } from "vitest";
import { calculateTradeValue } from "./model";
import type { MlbTradeInput } from "./types";
function player(name:string):MlbTradeInput{return{kind:"mlb",id:1,name,teamId:110,team:"Test",position:"DH",role:"hitter",age:30,seasons:[],contract:{currentSalary:null,guaranteedRemaining:null,yearsRemaining:null,preArbitrationYears:null,arbitrationYears:null,clubOptions:null,playerOptions:null,hasOptOut:null,freeAgentYear:null,status:"unknown",source:"unavailable"}}}
describe("name-independent valuation",()=>{it("never assigns values from a player-name allowlist",()=>{const names=["Yordan Alvarez","Shohei Ohtani","Juan Soto","Aaron Judge"];expect(new Set(names.map(name=>calculateTradeValue(player(name)).value)).size).toBe(1);expect(calculateTradeValue(player("Shohei Ohtani")).provisional).toBe(true)})});
