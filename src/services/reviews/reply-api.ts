import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { REVIEW_RESPONSE_SOURCE_ZYENE } from "@/lib/reviews/response-source";
import { invalidateDashboardStatsCache } from "@/lib/dashboard/invalidate-dashboard-stats-cache";
import { reviewReplySchema } from "./reply-schema";
import {
    deleteGoogleReviewReply,
    fetchAuthorizedGoogleReview,
    mapReviewReplyError,
    postGoogleReviewReply,
} from "./reply-review-access";

export async function handleReviewReplyPost(request: Request, reviewId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    try {
        const parsed = reviewReplySchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400 });
        }
        const { text } = parsed.data;

        const access = await fetchAuthorizedGoogleReview(reviewId, user.id);
        if (!access.ok) return access.response;

        const { review } = access;
        await postGoogleReviewReply(review.platform_id!, review.external_id!, text);

        const admin = createAdminClient();
        const { error: updateError } = await admin
            .from("reviews")
            .update({
                response_status: "responded",
                response_text: text,
                responded_at: new Date().toISOString(),
                response_source: REVIEW_RESPONSE_SOURCE_ZYENE,
            })
            .eq("id", review.id);

        if (updateError) throw updateError;

        await invalidateDashboardStatsCache(review.business_id ?? undefined);

        return apiOk({ replied: true });
    } catch (error: unknown) {
        logger.error({ err: error }, "Reply API Error:");
        return mapReviewReplyError(error);
    }
}

export async function handleReviewReplyDelete(_request: Request, reviewId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    try {
        const access = await fetchAuthorizedGoogleReview(reviewId, user.id);
        if (!access.ok) return access.response;

        const { review } = access;
        await deleteGoogleReviewReply(review.platform_id!, review.external_id!);

        const admin = createAdminClient();
        const { error: updateError } = await admin
            .from("reviews")
            .update({
                response_status: "pending",
                response_text: null,
                responded_at: null,
                response_source: null,
            })
            .eq("id", review.id);

        if (updateError) throw updateError;

        await invalidateDashboardStatsCache(review.business_id ?? undefined);

        return apiOk({ deleted: true });
    } catch (error: unknown) {
        logger.error({ err: error }, "Delete reply API Error:");
        return mapReviewReplyError(error);
    }
}
