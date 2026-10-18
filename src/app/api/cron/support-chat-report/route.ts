import { NextResponse } from "next/server";

import { runCronJob } from "@/lib/cron/run-cron-job";
import { runSupportChatWeeklyReport } from "@/services/support-chat/report/weekly-report";

export const dynamic = "force-dynamic";

/** Weekly website-chat report (unanswered questions, feedback, leads) + 180-day transcript purge. */
export async function GET(request: Request) {
    return runCronJob(request, { name: "support-chat-report", cadence: "weekly" }, async () =>
        NextResponse.json({ success: true, ...(await runSupportChatWeeklyReport()) }));
}
