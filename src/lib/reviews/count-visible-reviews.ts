import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

export type VisibleReviewCountOptions = {
    /** When set, only rows with this `reviews.platform` value are counted. */
    platform?: string;
};

/**
 * Exact count of `reviews` rows for a business with `is_visible = true`.
 * Use for UI and APIs instead of `businesses.total_reviews` or `review_platforms.total_reviews`.
 */
export async function countVisibleReviewsForBusiness(
    supabase: SupabaseClient<Database>,
    businessId: string,
    opts?: VisibleReviewCountOptions
): Promise<{ count: number; error: { message: string } | null }> {
    let q = supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("is_visible", true);

    if (opts?.platform) {
        q = q.eq("platform", opts.platform);
    }

    const { count, error } = await q;
    return { count: count ?? 0, error };
}
