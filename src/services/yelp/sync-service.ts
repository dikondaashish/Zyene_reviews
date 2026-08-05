import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getReviews, getBusiness } from "./adapter";
import { analyzeReview } from "@/domains/ai/services/ai-analysis-service";
import { sendReviewAlert } from "@/lib/notifications/review-alert";

export interface YelpSyncResult {
    success: boolean;
    total: number;
    analyzed: number;
    alerts: number;
}

/**
 * Sync Yelp reviews for a given review_platform record.
 *
 * NOTE: Yelp API only returns the 3 most recent reviews per call.
 * This means we poll frequently via cron to catch new reviews.
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
        // 2. Fetch reviews from Yelp (max 3)
        const yelpReviews = await getReviews(yelpBusinessId);
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

        // 6. Update platform stats
        const { count, data: allReviews } = await admin
            .from("reviews")
            .select("rating", { count: "exact" })
            .eq("business_id", platform.business_id)
            .eq("platform", "yelp");

        const totalReviews = count || 0;
        const avgRating =
            allReviews && allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                allReviews.length
                : 0;

        // Also fetch live Yelp stats
        let liveReviewCount = totalReviews;
        let liveRating = avgRating;
        try {
            const bizData = await getBusiness(yelpBusinessId);
            liveReviewCount = bizData.reviewCount;
            liveRating = bizData.rating;
        } catch {
            // Use local counts if live fetch fails
        }

        await admin
            .from("review_platforms")
            .update({
                last_synced_at: new Date().toISOString(),
                total_reviews: liveReviewCount,
                average_rating: parseFloat(liveRating.toFixed(1)),
                sync_status: "active",
            })
            .eq("id", platformId);

        return {
            success: true,
            total: yelpReviews.length,
            analyzed: analyzedCount,
            alerts: alertsCount,
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
