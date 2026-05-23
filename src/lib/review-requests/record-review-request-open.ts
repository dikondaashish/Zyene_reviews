import { createAdminClient } from "@/lib/db/supabase/admin";

/**
 * Marks a review request as opened/clicked (same rules as POST /api/track/review-open).
 * Safe to call from RSC (GET) so tracking does not depend on client JS or prefetch quirks.
 */
export async function recordReviewRequestOpenForRef(args: {
    businessId: string;
    requestId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
    const { businessId, requestId } = args;
    const nowIso = new Date().toISOString();
    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
        .from("review_requests")
        .select("id,status")
        .eq("id", requestId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (lookupError) {
        console.error("[record-review-open] lookup error", {
            requestId,
            businessId,
            message: lookupError.message,
        });
        return { ok: false, reason: "lookup_failed" };
    }
    if (!existing) {
        return { ok: false, reason: "not_found" };
    }

    const terminalStatuses = new Set(["completed", "review_left", "feedback_left"]);
    const nextStatus = terminalStatuses.has(existing.status) ? existing.status : "clicked";

    const { error: updateError } = await supabase
        .from("review_requests")
        .update({
            status: nextStatus,
            opened_at: nowIso,
            clicked_at: nowIso,
        })
        .eq("id", requestId)
        .eq("business_id", businessId);

    if (updateError) {
        console.error("[record-review-open] update failed", {
            requestId,
            businessId,
            message: updateError.message,
        });
        return { ok: false, reason: "update_failed" };
    }

    console.info("[record-review-open] ok", {
        requestId,
        businessId,
        priorStatus: existing.status,
        nextStatus,
    });
    return { ok: true };
}
