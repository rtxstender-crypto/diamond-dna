export const REFRESH_TARGETS = ["mlb-current", "mlb-identity", "milb-current-and-identity"] as const;
export type RefreshTarget = (typeof REFRESH_TARGETS)[number];

export interface RefreshSummary {
  target: RefreshTarget;
  ok: boolean;
  records: number | null;
  durationMs: number;
  error: "timeout" | "upstream" | null;
}

export interface RefreshDependencies {
  loaders: Record<RefreshTarget, () => Promise<number>>;
  timeoutMs: number;
  now: () => number;
  logError: (target: RefreshTarget, reason: "timeout" | "upstream", error: unknown) => void;
}

class RefreshTimeoutError extends Error {}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new RefreshTimeoutError("Scheduled refresh timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function refreshDatasets(targets: readonly RefreshTarget[], dependencies: RefreshDependencies): Promise<RefreshSummary[]> {
  return Promise.all(targets.map(async target => {
    const started = dependencies.now();
    try {
      const records = await withTimeout(dependencies.loaders[target](), dependencies.timeoutMs);
      return { target, ok: true, records, durationMs: Math.max(0, dependencies.now() - started), error: null };
    } catch (error) {
      const reason = error instanceof RefreshTimeoutError ? "timeout" : "upstream";
      dependencies.logError(target, reason, error);
      return { target, ok: false, records: null, durationMs: Math.max(0, dependencies.now() - started), error: reason };
    }
  }));
}

export function isAuthorizedCron(request: Request, secret: string | undefined): boolean {
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function handleScheduledRefresh(
  request: Request,
  targets: readonly RefreshTarget[],
  options: { secret: string | undefined; dependencies: RefreshDependencies },
): Promise<Response> {
  if (!isAuthorizedCron(request, options.secret)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const results = await refreshDatasets(targets, options.dependencies);
  const successful = results.filter(result => result.ok).length;
  const timedOut = results.some(result => result.error === "timeout");
  const status = successful === results.length ? 200 : successful > 0 ? 207 : timedOut ? 504 : 502;
  console.info(JSON.stringify({ level: "info", event: "scheduled_refresh_complete", successful, failed: results.length - successful, targets: results.map(result => result.target), at: new Date().toISOString() }));
  return Response.json({ ok: successful === results.length, results }, { status, headers: { "cache-control": "no-store" } });
}
