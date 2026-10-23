import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getReviews, getBusiness, type NormalizedYelpReview } from "./adapter";
import { YelpApiError } from "./client";
import { YELP_REVIEWS_UNAVAILABLE_KEY } from "./sync-state";
import { analyzeReview } from "@/domains/ai/services/ai-analysis-service";
import { sendReviewAlert } from "@/lib/notifications/review-alert";

export interface YelpSyncResult {
    success: boolean;
    total: number;
    analyzed: number;
    alerts: number;
    /** True when the Yelp API plan does not include the reviews endpoint (rating/count still sync). */
    reviewsUnavailable: boolean;
}


/** Free Yelp API plans answer the reviews endpoint with 404; treat that as "no review text", not an outage. */
async function fetchReviewsIfAvailable(
    yelpBusinessId: string
): Promise<{ reviews: NormalizedYelpReview[]; unavailable: boolean }> {
    try {
        return { reviews: await getReviews(yelpBusinessId), unavailable: false };
    } catch (error: unknown) {
        if (error instanceof YelpApiError && error.status === 404) {
            return { reviews: [], unavailable: true };
        }
        throw error;
    }
}

/**
 * Sync Yelp reviews for a given review_platform record.
 *
 * NOTE: Yelp API only returns the 3 most recent reviews per call, and free plans
 * return none (404); rating and review count still come from business details.
 */
export async function syncYelpReviewsForPlatform(
    platformId: string
): Promise<YelpSyncResult> {
    const admin = createAdminClient();

    // 1. Get platform record
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        throw new Error(`Yelp platform not found: ${platformId}`);
    }

    const yelpBusinessId = platform.external_id;
    if (!yelpBusinessId) {
        throw new Error(`No Yelp business ID for platform ${platformId}`);
    }

    try {
        // 2. Business details are on every plan; review text only on plans that include it.
        const bizData = await getBusiness(yelpBusinessId);
        const { reviews: yelpReviews, unavailable: reviewsUnavailable } =
            await fetchReviewsIfAvailable(yelpBusinessId);
        let analyzedCount = 0;
        let alertsCount = 0;

        // 3. Upsert each review
        const syncOutcomes = await Promise.all(
            yelpReviews.map(async (review) => {
                const reviewData = {
                    business_id: platform.business_id,
                    platform: "yelp" as const,
                    platform_id: platform.id,
                    external_id: review.externalId,
                    external_url: review.externalUrl,
                    author_name: review.authorName,
                    author_avatar_url: review.authorAvatarUrl,
                    rating: review.rating,
                    text: review.content,
                    review_date: review.publishedAt,
                    response_status: "pending" as const,
                };

                const { data: upserted, error: upsertError } = await admin
                    .from("reviews")
                    .upsert(reviewData, {
                        onConflict: "business_id, platform, external_id",
                    })
                    .select()
                    .single();

                if (upsertError) {
                    logger.error(
                        { err: upsertError },
                        `[Yelp Sync] Upsert error for review ${review.externalId}:`
                    );
                    return { analyzed: false, alerted: false };
                }

                if (upserted && !upserted.sentiment && upserted.text) {
                    const analysisResult = await analyzeReview(upserted);
                    await sendReviewAlert({ ...upserted, ...(analysisResult || {}) });
                    return { analyzed: true, alerted: true };
                }

                return { analyzed: false, alerted: false };
            })
        );
        analyzedCount = syncOutcomes.filter((o) => o.analyzed).length;
        alertsCount = syncOutcomes.filter((o) => o.alerted).length;

        // 6. Update platform stats from Yelp's live listing numbers
        const previousState =
            platform.sync_state && typeof platform.sync_state === "object" && !Array.isArray(platform.sync_state)
                ? platform.sync_state
                : {};
        await admin
            .from("review_platforms")
            .update({
                last_synced_at: new Date().toISOString(),
                total_reviews: bizData.reviewCount,
                average_rating: parseFloat(bizData.rating.toFixed(1)),
                sync_status: "active",
                sync_state: { ...previousState, [YELP_REVIEWS_UNAVAILABLE_KEY]: reviewsUnavailable },
            })
            .eq("id", platformId);

        return {
            success: true,
            total: yelpReviews.length,
            analyzed: analyzedCount,
            alerts: alertsCount,
            reviewsUnavailable,
        };
    } catch (error: unknown) {
        logger.error({ err: error }, `[Yelp Sync] Error for platform ${platformId}:`);
        await admin
            .from("review_platforms")
            .update({
                sync_status: "error_api_call",
                updated_at: new Date().toISOString(),
            })
            .eq("id", platformId);
        throw error;
    }
}
