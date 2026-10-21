import { createAdminClient } from "@/lib/db/supabase/admin";
import { REVIEW_RESPONSE_SOURCE_ZYENE, REVIEW_RESPONSE_SOURCE_ZYENE_AUTO } from "@/lib/reviews/response-source";
import { postGoogleReviewReply } from "@/services/reviews/reply-review-access";

/**
 * Post a reply to Google and mark the review as responded (auto rules, templates, or an
 * approved draft). For background jobs and approvals - uses the service role.
 *
 * Returns false (and posts nothing) when the review was answered in the meantime: Google's
 * reply endpoint overwrites, so we re-check right before posting to avoid replacing a reply.
 */
export async function postGoogleReplySystem(
    reviewId: string,
    text: string,
    options: { approved?: boolean } = {},
): Promise<boolean> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error("Reply text is empty");

    const admin = createAdminClient();
    const { data: review, error } = await admin
        .from("reviews")
        .select("id, business_id, platform, platform_id, external_id, response_status")
        .eq("id", reviewId)
        .single();

    if (error || !review) {
        throw new Error("Review not found");
    }
    if (review.response_status !== "pending") return false;

    if (review.platform !== "google") {
        throw new Error("Only Google reviews support auto-reply");
    }
    if (!review.platform_id || !review.external_id) {
        throw new Error("Review missing platform or external id");
    }

    const { data: authorizedPlatform, error: platformError } = await admin.from("review_platforms")
        .select("id, business_id").eq("id", review.platform_id)
        .eq("business_id", review.business_id).maybeSingle();
    if (platformError || authorizedPlatform?.business_id !== review.business_id) {
        throw new Error("Review integration does not belong to its business");
    }

    // Same location resolution as manual dashboard replies (google_location_id first).
    await postGoogleReviewReply(review.platform_id as string, review.external_id as string, trimmed);

    const { error: updateError } = await admin
        .from("reviews")
        .update({
            response_status: "responded",
            response_text: trimmed,
            responded_at: new Date().toISOString(),
            response_source: options.approved ? REVIEW_RESPONSE_SOURCE_ZYENE : REVIEW_RESPONSE_SOURCE_ZYENE_AUTO,
        })
        .eq("id", review.id);

    if (updateError) throw updateError;
    return true;
}
