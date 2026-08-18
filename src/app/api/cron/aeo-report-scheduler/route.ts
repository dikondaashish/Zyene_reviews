import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";

export const maxDuration = 60;

export async function GET(request: Request) {
    if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await createAdminClient().from("aeo_report_schedules" as never)
        .select("id" as never).eq("enabled" as never, true as never)
        .lte("next_send_at" as never, new Date().toISOString() as never)
        .order("next_send_at" as never, { ascending: true }).limit(100) as unknown as {
            data: { id: string }[] | null; error: { message: string } | null;
        };
    if (result.error) return NextResponse.json({ error: "Unable to load due reports" }, { status: 500 });
    const rows = result.data ?? [];
    if (rows.length) {
        await inngest.send(rows.map((row) => ({ name: "aeo/report.requested" as const, data: { scheduleId: row.id } })));
    }
    return NextResponse.json({ queued: rows.length });
}
