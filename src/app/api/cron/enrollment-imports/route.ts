import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { runEnrollmentImports } from "@/services/enrollment/run-enrollment-imports";

export const dynamic = "force-dynamic";

/**
 * Gradual campaign enrollment (CSV imports, invoice-copy email). Runs every 15 minutes
 * (vercel.json); each import enrolls at most its daily limit per local day.
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "enrollment-imports", cadence: "fifteen-minute", leaseSeconds: 600 }, async () => {
        try {
            const summary = await runEnrollmentImports(createAdminClient());
            return NextResponse.json({ success: true, ...summary });
        } catch (error: unknown) {
            logger.error({ err: error }, "[Cron] enrollment-imports:");
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    });
}
