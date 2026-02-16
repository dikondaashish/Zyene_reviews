import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGoogleToken, listAccounts, listLocations, listReviews } from "./business-profile";
import { analyzeReview } from "@/lib/ai/analysis";
import { sendReviewAlert } from "@/lib/notifications/review-alert";

export async function getValidGoogleToken(platformId: string) {
    const admin = createAdminClient();
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) throw new Error("Platform not found");

    let accessToken = platform.access_token;
    const refreshToken = platform.refresh_token;

    // Check Token Expiry (Buffer: 5 minutes)
    const now = new Date();
    const expiry = platform.token_expires_at ? new Date(platform.token_expires_at) : null;
    const isExpired = !expiry || (expiry.getTime() - now.getTime() < 5 * 60 * 1000);

    if (isExpired) {
        console.log(`[Token] Expired for platform ${platformId}. Refreshing...`);

        if (!refreshToken) {
            await admin.from("review_platforms").update({ sync_status: 'error_no_refresh_token' }).eq("id", platformId);
            throw new Error("No refresh token available");
        }

        try {
            const tokens = await refreshGoogleToken(refreshToken);
            accessToken = tokens.access_token;
            // Calculate new expiry (tokens.expires_in is in seconds)
            const newExpiry = new Date(now.getTime() + (tokens.expires_in * 1000));

            await admin.from("review_platforms").update({
                access_token: accessToken,
                token_expires_at: newExpiry.toISOString(),
                sync_status: 'active',
                updated_at: new Date().toISOString(),
            }).eq("id", platformId);

            console.log(`[Token] Refreshed. New expiry: ${newExpiry.toISOString()}`);

            return { accessToken, platform: { ...platform, access_token: accessToken, token_expires_at: newExpiry.toISOString() } };
        } catch (error) {
            console.error(`[Token] Refresh failed:`, error);
            await admin.from("review_platforms").update({
                sync_status: 'error_refresh_failed',
                updated_at: new Date().toISOString()
            }).eq("id", platformId);
            throw new Error("Failed to refresh token");
        }
    }

    return { accessToken, platform };
}

export async function syncGoogleReviewsForPlatform(platformId: string) {
    const admin = createAdminClient();

    // 1. Get Valid Token
    const { accessToken, platform } = await getValidGoogleToken(platformId);

    // 2. Fetch Reviews
    try {
        // A. List Accounts
        const accounts = await listAccounts(accessToken);
        if (accounts.length === 0) throw new Error("No Google Accounts found via API");
        const account = accounts[0]; // Default to first account

        // B. List Locations
        let locationId = platform.external_id;

        // If we don't have a location ID yet, try to find it
        if (!locationId) {
            const locations = await listLocations(accessToken, account.name);
            if (locations.length === 0) throw new Error("No Locations found for this account");
            locationId = locations[0].name.split("/").pop();
        }

        // C. List Reviews
        const accountId = account.name.split("/")[1];

        console.log(`[Sync] Fetching reviews for Account: ${accountId}, Location: ${locationId}`);
        const googleReviews = await listReviews(accessToken, accountId, locationId!);

        console.log(`[Sync] Fetched ${googleReviews.length} reviews`);

        let newReviewCount = 0;
        let analyzedCount = 0;
        let alertsCount = 0;

        for (const review of googleReviews) {
            const ratingMap: Record<string, number> = { "FIVE": 5, "FOUR": 4, "THREE": 3, "TWO": 2, "ONE": 1 };
            const numericRating = ratingMap[review.starRating] || 0;

            const reviewData = {
                business_id: platform.business_id,
                platform: "google",
                platform_id: platform.id,
                external_id: review.reviewId,
                author_name: review.reviewer.displayName,
                rating: numericRating,
                content: review.comment || "",
                published_at: review.createTime, // ISO string
                response_status: review.reviewReply ? "responded" : "pending",
                response_text: review.reviewReply?.comment || null,
                responded_at: review.reviewReply?.updateTime || null,
                response_source: review.reviewReply ? 'google' : null
            };

            const { data: upserted, error: upsertError } = await admin
                .from("reviews")
                .upsert(reviewData, { onConflict: "business_id, platform, external_id" })
                .select()
                .single();

            if (upsertError) console.error("Upsert Error:", upsertError);
            else {
                // Check if it was just inserted (created_at is close to now, or logic based on absence of sentiment)
                // Reliable way for "newly found" in this context is just total processed from API.
                // User asked "how many new reviews found".
                // If it's an upsert, we don't know if it was insert or update easily without checking created_at vs updated_at.
                // But `analyzedCount` is a good proxy for "new processing".

                // 4. Trigger AI Analysis if not analyzed
                if (upserted && !upserted.sentiment && upserted.content) {
                    console.log(`[AI] Analyzing review ${upserted.id}...`);
                    analyzedCount++;
                    const result = await analyzeReview(upserted);

                    // 5. Send Alert if Urgent
                    if (result) {
                        await sendReviewAlert({ ...upserted, ...result });
                        alertsCount++;
                    }
                }
            }
        }

        // 4. Update Platform Stats
        const { count, data: reviews } = await admin
            .from("reviews")
            .select("rating", { count: 'exact' })
            .eq("business_id", platform.business_id)
            .eq("platform", "google");

        const totalReviews = count || 0;
        const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0;

        await admin.from("review_platforms").update({
            last_synced_at: new Date().toISOString(),
            total_reviews: totalReviews,
            average_rating: parseFloat(avgRating.toFixed(1)),
            sync_status: "active",
            external_id: locationId, // Save the finalized Location ID
        }).eq("id", platformId);

        await admin.from("businesses").update({
            total_reviews: totalReviews,
            average_rating: parseFloat(avgRating.toFixed(1))
        }).eq("id", platform.business_id);

        return {
            success: true,
            total: googleReviews.length,
            analyzed: analyzedCount,
            alerts: alertsCount
        };

    } catch (error: any) {
        console.error(`[Sync] Implementation Error:`, error);
        await admin.from("review_platforms").update({
            sync_status: 'error_api_call',
            updated_at: new Date().toISOString()
        }).eq("id", platformId);
        throw error;
    }
}
