import type { SupabaseClient } from "@supabase/supabase-js";
import { inngest } from "@/services/inngest/client";

/**
 * Re-queues a review request for later (quiet hours). The row goes back to "queued" with
 * scheduled_for set, and the scheduled-send worker plus the scheduled-requests cron (backstop)
 * pick it up. All eligibility checks run again at that time.
 */
export async function deferReviewRequest(admin: SupabaseClient, args: {
    requestId: string; businessId: string; until: Date; reason: string;
}): Promise<void> {
    const sendAt = args.until.toISOString();
    const { error } = await admin.from("review_requests")
        .update({ status: "queued", scheduled_for: sendAt, deferred_reason: args.reason, sent_at: null })
        .eq("id", args.requestId).eq("business_id", args.businessId)
        .in("status", ["queued", "sending", "processing"]);
    if (error) throw error;
    await inngest.send({
        id: `review-request-deferred:${args.requestId}:${sendAt}`,
        name: "review-request/scheduled.send",
        data: { reviewRequestId: args.requestId, sendAt },
    });
}

export function quietHoursReason(until: Date, timezone: string | null | undefined): string {
    const label = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone || "UTC", weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(until);
    return `Delayed by quiet hours until ${label}`;
}
