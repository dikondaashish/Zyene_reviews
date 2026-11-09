import type { SupabaseClient } from "@supabase/supabase-js";

/** PostgREST caps a single response at 1000 rows; page at that size. */
export const RECENT_REVIEW_PAGE_SIZE = 1000;
/** Hard stop so a runaway loop cannot spin forever (10M reviews/week). */
const MAX_PAGES = 10_000;

/**
 * Distinct business ids with at least one review created in [since, until].
 *
 * The weekly digest used to read these from ONE unpaginated query, which
 * PostgREST silently truncates at 1000 rows: once the platform had more than
 * 1000 reviews in a week, every business outside the newest 1000 got no
 * digest. This pages through with a stable order (created_at, id) and an
 * upper bound so rows inserted mid-scan cannot shift earlier pages.
 */
export async function listRecentReviewBusinessIds(
    admin: SupabaseClient,
    since: Date,
    until: Date,
): Promise<string[]> {
    const ids = new Set<string>();
    for (let page = 0; page < MAX_PAGES; page++) {
        const from = page * RECENT_REVIEW_PAGE_SIZE;
        const { data, error } = await admin
            .from("reviews")
            .select("id, business_id")
            .gte("created_at", since.toISOString())
            .lte("created_at", until.toISOString())
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .range(from, from + RECENT_REVIEW_PAGE_SIZE - 1);
        if (error) throw new Error(`Failed to list recent reviews: ${error.message}`);
        const rows = (data ?? []) as { business_id: string | null }[];
        for (const row of rows) if (row.business_id) ids.add(row.business_id);
        if (rows.length < RECENT_REVIEW_PAGE_SIZE) return Array.from(ids);
    }
    throw new Error("Recent review scan exceeded page limit");
}
