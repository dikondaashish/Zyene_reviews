import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { calculateReviewMetrics } from "@/lib/metrics/business-metrics";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";

export type VisibleReviewRollup = {
    /** All stored rows, including hidden rows. Diagnostics only. */
    totalReviewRows: number;
    /** Canonical review metrics use `is_visible = true` across every connected platform. */
    totalVisible: number;
    respondedVisible: number;
    pendingVisible: number;
    responseRateVisible: number;
    averageRatingVisible: number;
    positiveVisible: number;
    neutralVisible: number;
    negativeVisible: number;
    positiveRateVisible: number;
    negativeRateVisible: number;
    googleRowCount: number;
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
        respondedVisible: 0,
        pendingVisible: 0,
        responseRateVisible: 0,
        averageRatingVisible: 0,
        positiveVisible: 0,
        neutralVisible: 0,
        negativeVisible: 0,
        positiveRateVisible: 0,
        negativeRateVisible: 0,
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
    | "business_id"
    | "rating"
    | "response_status"
    | "responded_at"
    | "platform"
    | "is_visible"
>;

function platformRollup(rows: ReviewRollupRow[], platform: string) {
    const platformRows = rows.filter((row) => row.platform === platform);
    const metrics = calculateReviewMetrics(
        platformRows.filter((row) => row.is_visible === true),
    );
    return { rowCount: platformRows.length, metrics };
}

/** Loads every review row so PostgREST's page cap can never under-count dashboard metrics. */
export async function fetchVisibleReviewRollupsByBusinessIds(
    supabase: SupabaseClient<Database>,
    businessIds: string[],
): Promise<Map<string, VisibleReviewRollup>> {
    const map = new Map(
        businessIds.map((id) => [id, emptyVisibleReviewRollup()]),
    );
    if (businessIds.length === 0) return map;

    const { data: allRows, error } =
        await fetchAllReviewRowsPaginated<ReviewRollupRow>(
            PAGE_SIZE,
            (from, to) =>
                supabase
                    .from("reviews")
                    .select(
                        "business_id, rating, response_status, responded_at, platform, is_visible",
                    )
                    .in("business_id", businessIds)
                    .order("id", { ascending: true })
                    .range(from, to),
        );

    if (error) {
        logger.error(
            { err: error },
            "[visible-review-rollups] paginated fetch failed:",
        );
        return map;
    }

    const rowsByBusiness = new Map(
        businessIds.map((id) => [id, [] as ReviewRollupRow[]]),
    );
    for (const row of allRows) {
        rowsByBusiness.get(row.business_id)?.push(row);
    }

    for (const id of businessIds) {
        const rows = rowsByBusiness.get(id) ?? [];
        const all = calculateReviewMetrics(
            rows.filter((row) => row.is_visible === true),
        );
        const google = platformRollup(rows, "google");
        const facebook = platformRollup(rows, "facebook");
        const yelp = platformRollup(rows, "yelp");

        map.set(id, {
            totalReviewRows: rows.length,
            totalVisible: all.totalReviews,
            respondedVisible: all.respondedReviews,
            pendingVisible: all.pendingReviews,
            responseRateVisible: all.responseRate,
            averageRatingVisible: Number(all.averageRating.toFixed(1)),
            positiveVisible: all.positiveReviews,
            neutralVisible: all.neutralReviews,
            negativeVisible: all.negativeReviews,
            positiveRateVisible: all.positiveRate,
            negativeRateVisible: all.negativeRate,
            googleRowCount: google.rowCount,
            googleVisibleCount: google.metrics.totalReviews,
            googleAverageRating: Number(
                google.metrics.averageRating.toFixed(1),
            ),
            facebookRowCount: facebook.rowCount,
            facebookVisibleCount: facebook.metrics.totalReviews,
            facebookAverageRating: Number(
                facebook.metrics.averageRating.toFixed(1),
            ),
            yelpRowCount: yelp.rowCount,
            yelpVisibleCount: yelp.metrics.totalReviews,
            yelpAverageRating: Number(yelp.metrics.averageRating.toFixed(1)),
        });
    }
    return map;
}
