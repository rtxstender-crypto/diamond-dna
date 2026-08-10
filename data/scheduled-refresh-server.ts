import "server-only";

import { fetchActivePlayerIndex } from "@/data/providers/mlb-player-index-provider";
import { fetchProspectDataset } from "@/data/providers/mlb-milb-provider";
import { getPlayerDataProvider } from "@/data/player-service";
import { logServerError } from "@/data/server-log";
import { handleScheduledRefresh, type RefreshDependencies, type RefreshTarget } from "@/data/scheduled-refresh";

const dependencies: RefreshDependencies = {
  loaders: {
    "mlb-current": async () => (await getPlayerDataProvider().listPlayers()).length,
    "mlb-identity": async () => (await fetchActivePlayerIndex()).length,
    "milb-current-and-identity": async () => (await fetchProspectDataset()).players.length,
  },
  timeoutMs: 50_000,
  now: Date.now,
  logError: (target, reason, error) => logServerError("scheduled_refresh_failed", error, { target, reason }),
};

export function handleProductionScheduledRefresh(request: Request, target: RefreshTarget) {
  return handleScheduledRefresh(request, [target], { secret: process.env.CRON_SECRET, dependencies });
}
