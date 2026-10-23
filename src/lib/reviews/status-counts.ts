import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

/** Visible public reviews per inbox filter. "All" is the public review count, so it isn't repeated here. */
export type ReviewStatusCounts = {
    needs_response: number;
    responded: number;
    ignored: number;
};

/** Inbox filter → `reviews.response_status` value it lists. */
export const REVIEW_STATUS_FILTERS = {
    needs_response: "pending",
    responded: "responded",
    ignored: "ignored",
} as const satisfies Record<keyof ReviewStatusCounts, string>;

/**
 * How many visible reviews sit under each inbox filter, ignoring rating and search so the
 * owner always sees the size of their whole to-do list. Null when any count fails, so the
 * page shows plain filter labels instead of a wrong number.
 */
export async function countReviewsByStatus(
    supabase: SupabaseClient<Database>,
    businessId: string,
): Promise<ReviewStatusCounts | null> {
    const keys = Object.keys(REVIEW_STATUS_FILTERS) as (keyof ReviewStatusCounts)[];
    const results = await Promise.all(
        keys.map((key) =>
            supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .eq("is_visible", true)
                .eq("response_status", REVIEW_STATUS_FILTERS[key]),
        ),
    );
    if (results.some((r) => r.error || r.count === null)) return null;
    return Object.fromEntries(keys.map((key, i) => [key, results[i].count ?? 0])) as ReviewStatusCounts;
}
