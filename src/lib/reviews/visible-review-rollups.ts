import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

export type VisibleReviewRollup = {
    /** All platforms, `reviews.is_visible = true` */
    totalVisible: number;
    pendingVisible: number;
    averageRatingVisible: number;
    /** Subset `platform = 'google'` */
    googleVisibleCount: number;
    googleAverageRating: number;
    facebookVisibleCount: number;
    facebookAverageRating: number;
    yelpVisibleCount: number;
    yelpAverageRating: number;
};

function emptyRollup(): VisibleReviewRollup {
    return {
        totalVisible: 0,
        pendingVisible: 0,
        averageRatingVisible: 0,
        googleVisibleCount: 0,
        googleAverageRating: 0,
        facebookVisibleCount: 0,
        facebookAverageRating: 0,
        yelpVisibleCount: 0,
        yelpAverageRating: 0,
    };
}

/**
 * Aggregates visible review counts/ratings per business from `reviews` (not `businesses` /
 * `review_platforms` denormalized totals, which can mirror Google's headline counts).
 */
export async function fetchVisibleReviewRollupsByBusinessIds(
    supabase: SupabaseClient<Database>,
    businessIds: string[]
): Promise<Map<string, VisibleReviewRollup>> {
    const map = new Map<string, VisibleReviewRollup>();
    for (const id of businessIds) {
        map.set(id, emptyRollup());
    }
    if (businessIds.length === 0) return map;

    const { data, error } = await supabase
        .from("reviews")
        .select("business_id, rating, response_status, platform")
        .eq("is_visible", true)
        .in("business_id", businessIds);

    if (error || !data) {
        return map;
    }

    type Acc = {
        count: number;
        sum: number;
        pending: number;
        gCount: number;
        gSum: number;
        fbCount: number;
        fbSum: number;
        yelpCount: number;
        yelpSum: number;
    };
    const accum = new Map<string, Acc>();
    for (const id of businessIds) {
        accum.set(id, { count: 0, sum: 0, pending: 0, gCount: 0, gSum: 0, fbCount: 0, fbSum: 0, yelpCount: 0, yelpSum: 0 });
    }

    for (const row of data) {
        const bid = row.business_id;
        const bucket = accum.get(bid);
        if (!bucket) continue;
        const rating = Number(row.rating ?? 0);
        bucket.count += 1;
        bucket.sum += rating;
        if (row.response_status === "pending") {
            bucket.pending += 1;
        }
        if (row.platform === "google") {
            bucket.gCount += 1;
            bucket.gSum += rating;
        } else if (row.platform === "facebook") {
            bucket.fbCount += 1;
            bucket.fbSum += rating;
        } else if (row.platform === "yelp") {
            bucket.yelpCount += 1;
            bucket.yelpSum += rating;
        }
    }

    for (const id of businessIds) {
        const a = accum.get(id)!;
        const avgAll = a.count > 0 ? parseFloat((a.sum / a.count).toFixed(1)) : 0;
        const avgG = a.gCount > 0 ? parseFloat((a.gSum / a.gCount).toFixed(1)) : 0;
        const avgFb = a.fbCount > 0 ? parseFloat((a.fbSum / a.fbCount).toFixed(1)) : 0;
        const avgY = a.yelpCount > 0 ? parseFloat((a.yelpSum / a.yelpCount).toFixed(1)) : 0;
        map.set(id, {
            totalVisible: a.count,
            pendingVisible: a.pending,
            averageRatingVisible: avgAll,
            googleVisibleCount: a.gCount,
            googleAverageRating: avgG,
            facebookVisibleCount: a.fbCount,
            facebookAverageRating: avgFb,
            yelpVisibleCount: a.yelpCount,
            yelpAverageRating: avgY,
        });
    }
    return map;
}
