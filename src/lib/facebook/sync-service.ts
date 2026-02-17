import { createAdminClient } from "@/lib/supabase/admin";
import { getReviews, getPageDetails } from "./adapter";
import { analyzeReview } from "@/lib/ai/analysis";
import { sendReviewAlert } from "@/lib/notifications/review-alert";

export interface FacebookSyncResult {
    success: boolean;
    total: number;
    analyzed: number;
    alerts: number;
}

/**
 * Sync Facebook page reviews for a given review_platform record.
 *
 * Uses the page access token stored in the platform to fetch reviews
 * via the Graph API /{pageId}/ratings endpoint.
 */
export async function syncFacebookReviewsForPlatform(
    platformId: string
): Promise<FacebookSyncResult> {
    const admin = createAdminClient();

    // 1. Get platform record
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        throw new Error(`Facebook platform not found: ${platformId}`);
    }

    const pageId = platform.external_id;
    const pageAccessToken = platform.access_token;

    if (!pageId || !pageAccessToken) {
        throw new Error(
            `Missing page ID or access token for platform ${platformId}`
        );
    }

    try {
        // 2. Fetch reviews from Facebook
        const fbReviews = await getReviews(pageId, pageAccessToken);
        console.log(
            `[Facebook Sync] Fetched ${fbReviews.length} reviews for page ${pageId}`
        );

        let analyzedCount = 0;
        let alertsCount = 0;

        // 3. Upsert each review
        for (const review of fbReviews) {
            const reviewData = {
                business_id: platform.business_id,
                platform: "facebook" as const,
                platform_id: platform.id,
                external_id: review.externalId,
                author_name: review.authorName,
                rating: review.rating,
                content: review.content,
                published_at: review.publishedAt,
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
                console.error(
                    `[Facebook Sync] Upsert error for review ${review.externalId}:`,
                    upsertError
                );
                continue;
            }

            // 4. AI analysis for new unanalyzed reviews
            if (upserted && !upserted.sentiment && upserted.content) {
                console.log(
                    `[Facebook AI] Analyzing review ${upserted.id}...`
                );
                analyzedCount++;
                const analysisResult = await analyzeReview(upserted);

                if (analysisResult) {
                    await sendReviewAlert({ ...upserted, ...analysisResult });
                    alertsCount++;
                }
            }
        }

        // 5. Update platform stats with live page data
        let liveRatingCount = fbReviews.length;
        let liveRating = 0;

        try {
            const pageDetails = await getPageDetails(pageId, pageAccessToken);
            liveRatingCount = pageDetails.ratingCount;
            liveRating = pageDetails.overallStarRating;
        } catch {
            // Fallback to local calculation
            const { count, data: allReviews } = await admin
                .from("reviews")
                .select("rating", { count: "exact" })
                .eq("business_id", platform.business_id)
                .eq("platform", "facebook");

            liveRatingCount = count || 0;
            liveRating =
                allReviews && allReviews.length > 0
                    ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                    allReviews.length
                    : 0;
        }

        await admin
            .from("review_platforms")
            .update({
                last_synced_at: new Date().toISOString(),
                total_reviews: liveRatingCount,
                average_rating: parseFloat(liveRating.toFixed(1)),
                sync_status: "active",
            })
            .eq("id", platformId);

        return {
            success: true,
            total: fbReviews.length,
            analyzed: analyzedCount,
            alerts: alertsCount,
        };
    } catch (error: any) {
        console.error(
            `[Facebook Sync] Error for platform ${platformId}:`,
            error
        );

        // Check if it's a token expiry issue
        const isTokenError =
            error.message?.includes("190") ||
            error.message?.includes("access token");

        await admin
            .from("review_platforms")
            .update({
                sync_status: isTokenError
                    ? "error_token_expired"
                    : "error_api_call",
                updated_at: new Date().toISOString(),
            })
            .eq("id", platformId);

        throw error;
    }
}
