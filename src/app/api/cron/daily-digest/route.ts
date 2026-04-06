
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { sendEmail } from "@/services/resend/send-email";
import { dailyDigestEmail } from "@/services/resend/templates/daily-digest-email";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
        const { data: recentReviews, error: reviewError } = await admin
            .from("reviews")
            .select(`
                id,
                rating,
                text,
                author_name,
                sentiment,
                created_at,
                business_id,
                businesses (
                    id,
                    name,
                    organization_id,
                    slug
                )
            `)
            .gte("created_at", yesterday.toISOString())
            .order("created_at", { ascending: false });

        if (reviewError) {
            // Heartbeat fail
            await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ/fail").catch(() => { });
            return NextResponse.json({ error: reviewError.message }, { status: 500 });
        }

        if (!recentReviews || recentReviews.length === 0) {
            // Success Heartbeat ping!
            await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ").catch(() => { });
            return NextResponse.json({ message: "No new reviews found" });
        }

        // 1. Get unique business IDs that have new reviews
        const businessIds = Array.from(new Set(recentReviews.map(r => r.business_id)));

        console.log(`[Cron] Dispatching daily digest for ${businessIds.length} businesses`);

        // 2. Dispatch background jobs via Inngest
        if (businessIds.length > 0) {
            await inngest.send(
                businessIds.map((id) => ({
                    name: "cron/daily-digest.business",
                    data: { businessId: id },
                }))
            );
        }

        // 3. Heartbeat success ping!
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ").catch(() => { });

        return NextResponse.json({
            success: true,
            dispatched: businessIds.length,
            message: "Daily digest background jobs fanned out"
        });
    } catch (error: unknown) {
        console.error("Daily Digest CRON Error:", error);
        // Heartbeat fail ping
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ/fail").catch(() => { });
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
