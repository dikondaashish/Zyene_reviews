
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
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
                business_id,
                businesses (
                    id,
                    name,
                    organization_id
                )
            `)
            .gte("created_at", yesterday.toISOString());

        if (reviewError) {
            // Heartbeat fail
            await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ/fail").catch(() => { });
            return NextResponse.json({ error: reviewError.message }, { status: 500 });
        }

        if (!recentReviews || recentReviews.length === 0) {
            // Success, just no reviews
            await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ").catch(() => { });
            return NextResponse.json({ message: "No new reviews found" });
        }

        // Group by business to find which businesses need digests
        const businessIds = Array.from(new Set(recentReviews.map(r => r.business_id)));
        const businessDataMap = new Map();
        recentReviews.forEach(r => {
            if (r.businesses && !businessDataMap.has(r.business_id)) {
                businessDataMap.set(r.business_id, r.businesses);
            }
        });

        // Dispatch Digest Generation via Inngest
        const events = Array.from(businessDataMap.values()).map(b => ({
            name: "business/digest.dispatch" as const,
            data: {
                businessId: b.id,
                businessName: b.name,
                organizationId: b.organization_id
            }
        }));

        await inngest.send(events);

        // Heartbeat success ping!
        // We ping success because the DISPATCHER has successfully fanned out the work.
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ").catch(() => { });

        return NextResponse.json({
            success: true,
            businessesEnqueued: businessDataMap.size,
            message: "Daily digest generation fanned out"
        });

    } catch (error: unknown) {
        console.error("Daily Digest CRON Error:", error);
        // Heartbeat fail ping
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ/fail").catch(() => { });
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
