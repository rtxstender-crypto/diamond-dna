import { describe, expect, it } from "vitest";
import { parseTrajectoryRequest } from "./trajectory-request";

describe("Career Trajectory request validation",()=>{
  it("accepts supported role, range, season, and specific year",()=>{expect(parseTrajectoryRequest(new URLSearchParams({name:"Test Player",role:"hitter",filter:"specific",year:"2005",season:"2026"}))).toEqual({name:"Test Player",role:"hitter",filter:"specific",specificYear:2005,season:2026})});
  it("rejects malformed and unbounded requests",()=>{expect(()=>parseTrajectoryRequest(new URLSearchParams({name:"x".repeat(101),role:"hitter"}))).toThrow("valid player name");expect(()=>parseTrajectoryRequest(new URLSearchParams({name:"Player",role:"catcher"}))).toThrow("valid player role");expect(()=>parseTrajectoryRequest(new URLSearchParams({name:"Player",role:"pitcher",filter:"forever"}))).toThrow("valid historical range");expect(()=>parseTrajectoryRequest(new URLSearchParams({name:"Player",role:"pitcher",filter:"specific",year:"1800"}))).toThrow("Historical year")});
});
