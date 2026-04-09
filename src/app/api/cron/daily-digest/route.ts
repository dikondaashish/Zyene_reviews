import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** @deprecated Use GET /api/cron/weekly-digest (same Bearer auth). */
export async function GET() {
    return NextResponse.json(
        {
            error: "Gone",
            message:
                "Daily digest was replaced by the weekly digest. Point cron-jobs.org to GET /api/cron/weekly-digest with the same Authorization: Bearer CRON_SECRET.",
        },
        { status: 410 }
    );
}
