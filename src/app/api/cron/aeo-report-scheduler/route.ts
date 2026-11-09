import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { inngest } from "@/services/inngest/client";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { loadDueReportScheduleIds } from "@/services/aeo/reporting/load-due-report-schedules";

export const maxDuration = 60;

const SEND_CHUNK = 200;

export async function GET(request: Request) {
    return runCronJob(request, { name: "aeo-report-scheduler", cadence: "daily" }, async ({ occurrenceKey }) => {
        let ids: string[];
        try {
            ids = await loadDueReportScheduleIds(createAdminClient());
        } catch (error) {
            logger.error({ err: error }, "[aeo-report-scheduler] due schedule load failed");
            return NextResponse.json({ error: "Unable to load due reports" }, { status: 500 });
        }
        for (let start = 0; start < ids.length; start += SEND_CHUNK) {
            await inngest.send(
                ids.slice(start, start + SEND_CHUNK).map((id) => ({
                    id: `cron:aeo-report-scheduler:${occurrenceKey}:${id}`,
                    name: "aeo/report.requested" as const,
                    data: { scheduleId: id },
                })),
            );
        }
        return NextResponse.json({ queued: ids.length });
    });
}
