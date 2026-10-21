import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { terminateReviewRequestDrip } from "@/lib/campaigns/terminate-drip";

/** Statuses a page open may advance to "clicked"; later facts (rated, finished) are never undone. */
const ADVANCE_FROM = ["queued", "sending", "processing", "sent", "delivered", "opened"];

/**
 * Records that the customer opened their review link (same rules as POST /api/track/review-open).
 * Safe to call from RSC (GET) so tracking does not depend on client JS or prefetch quirks.
 * First open/click times are kept (not overwritten by later visits). A click is not a review:
 * reminders stop here only when the campaign's "stop after click" setting is on.
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
        .select("id, status, campaign_id, opened_at, clicked_at")
        .eq("id", requestId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (lookupError) {
        logger.error({ err: { requestId, businessId, message: lookupError.message } }, "[record-review-open] lookup error");
        return { ok: false, reason: "lookup_failed" };
    }
    if (!existing) {
        return { ok: false, reason: "not_found" };
    }

    const writes = [
        supabase.from("review_requests").update({ opened_at: nowIso }).eq("id", requestId).eq("business_id", businessId).is("opened_at", null),
        supabase.from("review_requests").update({ clicked_at: nowIso }).eq("id", requestId).eq("business_id", businessId).is("clicked_at", null),
        supabase.from("review_requests").update({ status: "clicked" }).eq("id", requestId).eq("business_id", businessId).in("status", ADVANCE_FROM),
    ];
    for (const write of writes) {
        const { error } = await write;
        if (error) {
            logger.error({ err: { requestId, businessId, message: error.message } }, "[record-review-open] update failed");
            return { ok: false, reason: "update_failed" };
        }
    }

    let stopOnClick = true;
    if (existing.campaign_id) {
        const { data: campaign } = await supabase.from("campaigns").select("stop_on_click")
            .eq("id", existing.campaign_id).eq("business_id", businessId).maybeSingle();
        stopOnClick = campaign?.stop_on_click !== false;
    }
    if (stopOnClick) await terminateReviewRequestDrip(supabase, requestId, "clicked");

    logger.info({ requestId, businessId, priorStatus: existing.status, stopOnClick }, "[record-review-open] ok");
    return { ok: true };
}
