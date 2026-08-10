import{describe,expect,it}from"vitest";import{refreshWithStaleFallback}from"./cache-config";import{filterProspects}from"./models/prospect";import{buildProspectIndex,parseMilbStatPayload,parseMilbTeams}from"./providers/mlb-milb-provider";
const teams=parseMilbTeams({teams:[{id:1,name:"AAA Club",abbreviation:"AAA",sport:{id:11},parentOrgId:100,parentOrgName:"Org"},{id:2,name:"AA Club",abbreviation:"AA",sport:{id:12},parentOrgId:100,parentOrgName:"Org"}]});
const stats=[...parseMilbStatPayload({stats:[{splits:[{season:"2026",player:{id:9},team:{id:1,name:"AAA Club"},stat:{gamesPlayed:10,plateAppearances:40,ops:".900"}}]}]},"Triple-A","hitter"),...parseMilbStatPayload({stats:[{splits:[{season:"2026",player:{id:9},team:{id:2,name:"AA Club"},stat:{gamesPlayed:20,plateAppearances:80,ops:".800"}}]}]},"Double-A","hitter")];
const people=[{people:[{id:9,fullName:"Test Prospect",active:true,currentAge:21,currentTeam:{id:1},primaryPosition:{type:"Outfielder",abbreviation:"OF"}},{id:9,fullName:"Test Prospect",active:true,currentTeam:{id:1},primaryPosition:{type:"Outfielder",abbreviation:"OF"}}]}];
describe("MiLB architecture",()=>{
 it("identifies levels and organizations",()=>expect(teams).toMatchObject([{level:"Triple-A",organization:"Org"},{level:"Double-A"}]));
 it("keeps multi-level lines separate and deduplicates identity",()=>{const p=buildProspectIndex(people,teams,stats);expect(p).toHaveLength(1);expect(p[0].statLines.map(s=>s.level).sort()).toEqual(["Double-A","Triple-A"])});
 it("supports search and current-level filters",()=>{const p=buildProspectIndex(people,teams,stats);expect(filterProspects(p,{query:"TEST",level:"Triple-A"})).toHaveLength(1);expect(filterProspects(p,{level:"Double-A"})).toHaveLength(0)});
 it("connects MLB identity through the shared ID",()=>expect(buildProspectIndex(people,teams,stats,new Set([9]))[0].mlbConnected).toBe(true));
 it("serves last valid data after failure",async()=>{const key=`test-${Date.now()}`;await refreshWithStaleFallback(key,async()=>[1]);expect(await refreshWithStaleFallback(key,async()=>{throw new Error("offline")})).toEqual({data:[1],stale:true})});
 it("throws on cold failure without fabricated data",async()=>await expect(refreshWithStaleFallback(`empty-${Date.now()}`,async()=>{throw new Error("offline")})).rejects.toThrow("offline"));
});
