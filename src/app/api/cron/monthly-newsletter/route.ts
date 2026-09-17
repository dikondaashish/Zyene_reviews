export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { runMonthlyNewsletter } from "@/services/cron/monthly-newsletter-run";

/**
 * Monthly marketing newsletter to blog/partners subscribers.
 * Schedule: 1st of each month, 10:00 - GET with Authorization: Bearer CRON_SECRET
 * (e.g. cron-jobs.org: "0 10 1 * *")
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "monthly-newsletter", cadence: "monthly", leaseSeconds: 1800 }, async () =>
        NextResponse.json({ success: true, ...(await runMonthlyNewsletter()) }),
    );
}
