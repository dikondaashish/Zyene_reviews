import type { SupabaseClient } from "@supabase/supabase-js";

export type RequestOutcomeFields = {
    review_confirmed_at: string | null;
    review_confirmation_source: "manual" | "matched" | null;
    error_message: string | null;
    deferred_reason: string | null;
    scheduled_for: string | null;
};

/**
 * Adds review-confirmation and skip/delay reasons to the visible page of requests (one small
 * query by id). Kept separate from the paginated metrics loader so stats stay cheap.
 */
export async function attachRequestOutcomes<T extends { id: string }>(
    admin: SupabaseClient, businessId: string, rows: T[],
): Promise<Array<T & Partial<RequestOutcomeFields>>> {
    if (!rows.length) return rows;
    const { data, error } = await admin.from("review_requests")
        .select("id, review_confirmed_at, review_confirmation_source, error_message, deferred_reason, scheduled_for")
        .eq("business_id", businessId).in("id", rows.map((r) => r.id));
    if (error || !data) return rows;
    const byId = new Map((data as Array<RequestOutcomeFields & { id: string }>).map((d) => [d.id, d]));
    return rows.map((row) => ({ ...row, ...(byId.get(row.id) ?? {}) }));
}
