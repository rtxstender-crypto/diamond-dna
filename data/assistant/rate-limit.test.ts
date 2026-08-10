import { beforeEach, describe, expect, it } from "vitest";
import { consumeRateLimit, RATE_LIMIT, resetRateLimits } from "./rate-limit";
describe("assistant rate limiting",()=>{beforeEach(resetRateLimits);it("limits a client within the configured window",()=>{for(let i=0;i<RATE_LIMIT.requests;i++)expect(consumeRateLimit("client",1000).allowed).toBe(true);expect(consumeRateLimit("client",1000).allowed).toBe(false)});it("resets after the window",()=>{consumeRateLimit("client",1000);expect(consumeRateLimit("client",1000+RATE_LIMIT.windowMs+1).remaining).toBe(RATE_LIMIT.requests-1)})});
