import { describe, expect, it, vi } from "vitest";
import { handleScheduledRefresh, type RefreshDependencies, type RefreshTarget } from "./scheduled-refresh";

const request = (secret = "test-cron-secret") => new Request("http://localhost/api/cron/refresh", { headers: { authorization: `Bearer ${secret}` } });
const dependencies = (loaders: RefreshDependencies["loaders"], timeoutMs = 100): RefreshDependencies => ({ loaders, timeoutMs, now: Date.now, logError: vi.fn() });
const loaders = (values: Partial<Record<RefreshTarget, () => Promise<number>>> = {}): RefreshDependencies["loaders"] => ({
  "mlb-current": values["mlb-current"] ?? (async () => 700),
  "mlb-identity": values["mlb-identity"] ?? (async () => 780),
  "milb-current-and-identity": values["milb-current-and-identity"] ?? (async () => 8_200),
});

describe("scheduled refresh", () => {
  it("rejects unauthorized and missing-secret requests", async () => {
    expect((await handleScheduledRefresh(request("wrong"), ["mlb-current"], { secret: "expected", dependencies: dependencies(loaders()) })).status).toBe(401);
    expect((await handleScheduledRefresh(request(), ["mlb-current"], { secret: "", dependencies: dependencies(loaders()) })).status).toBe(401);
  });

  it("runs an authorized provider refresh", async () => {
    const load = vi.fn(async () => 696);
    const response = await handleScheduledRefresh(request(), ["mlb-current"], { secret: "test-cron-secret", dependencies: dependencies(loaders({ "mlb-current": load })) });
    expect(response.status).toBe(200);
    expect(load).toHaveBeenCalledOnce();
    expect(await response.json()).toMatchObject({ ok: true, results: [{ target: "mlb-current", ok: true, records: 696 }] });
  });

  it("reports partial upstream failure without discarding successful work", async () => {
    const response = await handleScheduledRefresh(request(), ["mlb-current", "mlb-identity"], { secret: "test-cron-secret", dependencies: dependencies(loaders({ "mlb-identity": async () => { throw new Error("offline"); } })) });
    expect(response.status).toBe(207);
    expect(await response.json()).toMatchObject({ ok: false, results: [{ target: "mlb-current", ok: true }, { target: "mlb-identity", ok: false, error: "upstream" }] });
  });

  it("returns a timeout status when an upstream operation hangs", async () => {
    const response = await handleScheduledRefresh(request(), ["milb-current-and-identity"], { secret: "test-cron-secret", dependencies: dependencies(loaders({ "milb-current-and-identity": () => new Promise(() => undefined) }), 5) });
    expect(response.status).toBe(504);
    expect(await response.json()).toMatchObject({ ok: false, results: [{ error: "timeout" }] });
  });
});
