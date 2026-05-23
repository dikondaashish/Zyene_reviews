import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";

export type VisibleReviewRollup = {
    /** All `reviews` rows stored for this business (includes `is_visible = false`). For diagnostics only; use `totalVisible` in UI. */
    totalReviewRows: number;
    /** All platforms, `reviews.is_visible = true` only — use for dashboards and “reviews in Zyene” style copy. */
    totalVisible: number;
    pendingVisible: number;
    averageRatingVisible: number;
    /** Google rows stored (sync volume). */
    googleRowCount: number;
    /** Subset `platform = 'google'` and visible. */
    googleVisibleCount: number;
    googleAverageRating: number;
    facebookRowCount: number;
    facebookVisibleCount: number;
    facebookAverageRating: number;
    yelpRowCount: number;
    yelpVisibleCount: number;
    yelpAverageRating: number;
};

export function emptyVisibleReviewRollup(): VisibleReviewRollup {
    return {
        totalReviewRows: 0,
        totalVisible: 0,
        pendingVisible: 0,
        averageRatingVisible: 0,
        googleRowCount: 0,
        googleVisibleCount: 0,
        googleAverageRating: 0,
        facebookRowCount: 0,
        facebookVisibleCount: 0,
        facebookAverageRating: 0,
        yelpRowCount: 0,
        yelpVisibleCount: 0,
        yelpAverageRating: 0,
    };
}

const PAGE_SIZE = 1000;

type ReviewRollupRow = Pick<
    Database["public"]["Tables"]["reviews"]["Row"],
    "business_id" | "rating" | "response_status" | "platform" | "is_visible"
>;

/**
 * Aggregates review counts/ratings per business from `reviews`.
 * Uses pagination because PostgREST caps each response at ~1000 rows — a single `.select()`
 * would under-count businesses with more reviews.
 */
export async function fetchVisibleReviewRollupsByBusinessIds(
    supabase: SupabaseClient<Database>,
    businessIds: string[]
): Promise<Map<string, VisibleReviewRollup>> {
    const map = new Map<string, VisibleReviewRollup>();
    for (const id of businessIds) {
        map.set(id, emptyVisibleReviewRollup());
    }
    if (businessIds.length === 0) return map;

    type Acc = {
        totalRows: number;
        count: number;
        sum: number;
        pending: number;
        googleRows: number;
        gCount: number;
        gSum: number;
        facebookRows: number;
        fbCount: number;
        fbSum: number;
        yelpRows: number;
        yelpCount: number;
        yelpSum: number;
    };
    const accum = new Map<string, Acc>();
    for (const id of businessIds) {
        accum.set(id, {
            totalRows: 0,
            count: 0,
            sum: 0,
            pending: 0,
            googleRows: 0,
            gCount: 0,
            gSum: 0,
            facebookRows: 0,
            fbCount: 0,
            fbSum: 0,
            yelpRows: 0,
            yelpCount: 0,
            yelpSum: 0,
        });
    }

    const { data: allRows, error: pagesError } = await fetchAllReviewRowsPaginated<ReviewRollupRow>(
        PAGE_SIZE,
        (from, to) =>
            supabase
                .from("reviews")
                .select("business_id, rating, response_status, platform, is_visible")
                .in("business_id", businessIds)
                .order("id", { ascending: true })
                .range(from, to)
    );

    if (pagesError) {
        logger.error({ err: pagesError }, "[visible-review-rollups] paginated fetch failed:");
        return map;
    }

    for (const row of allRows) {
        const bid = row.business_id;
        const bucket = accum.get(bid);
        if (!bucket) continue;

        bucket.totalRows += 1;

        const platform = row.platform;
        if (platform === "google") {
            bucket.googleRows += 1;
        } else if (platform === "facebook") {
            bucket.facebookRows += 1;
        } else if (platform === "yelp") {
            bucket.yelpRows += 1;
        }

        const visible = row.is_visible === true;
        if (!visible) continue;

        const rating = Number(row.rating ?? 0);
        bucket.count += 1;
        bucket.sum += rating;
        if (row.response_status === "pending") {
            bucket.pending += 1;
        }

        if (platform === "google") {
            bucket.gCount += 1;
            bucket.gSum += rating;
        } else if (platform === "facebook") {
            bucket.fbCount += 1;
            bucket.fbSum += rating;
        } else if (platform === "yelp") {
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
            totalReviewRows: a.totalRows,
            totalVisible: a.count,
            pendingVisible: a.pending,
            averageRatingVisible: avgAll,
            googleRowCount: a.googleRows,
            googleVisibleCount: a.gCount,
            googleAverageRating: avgG,
            facebookRowCount: a.facebookRows,
            facebookVisibleCount: a.fbCount,
            facebookAverageRating: avgFb,
            yelpRowCount: a.yelpRows,
            yelpVisibleCount: a.yelpCount,
            yelpAverageRating: avgY,
        });
    }
    return map;
}
