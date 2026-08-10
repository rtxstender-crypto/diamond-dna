import { handleProductionScheduledRefresh } from "@/data/scheduled-refresh-server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleProductionScheduledRefresh(request, "milb-current-and-identity");
}
