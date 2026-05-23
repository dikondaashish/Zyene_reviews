export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { executeCompetitorWatchCron } from "@/services/cron/competitor-watch-run";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    await pingCompetitorWatchHeartbeat(false);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return executeCompetitorWatchCron(request);
}
