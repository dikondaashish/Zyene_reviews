import type { SupabaseClient } from "@supabase/supabase-js";

export type PendingReplyDraft = {
    id: string;
    rating: number | null;
    draftText: string;
    source: "ai" | "template";
    status: "pending" | "failed";
    error: string | null;
    createdAt: string;
    review: { authorName: string | null; rating: number | null; text: string | null; reviewDate: string | null } | null;
};

/** Pending and failed drafts for one business (server-side, after the caller checked access). */
export async function loadPendingReplyDrafts(admin: SupabaseClient, businessId: string): Promise<PendingReplyDraft[]> {
    const { data, error } = await admin.from("review_reply_drafts")
        .select("id, rating, draft_text, source, status, error, created_at, reviews(author_name, rating, text, review_date)")
        .eq("business_id", businessId).in("status", ["pending", "failed"])
        .order("created_at", { ascending: false }).limit(50);
    if (error || !data) return [];
    return data.map((row) => {
        const review = (Array.isArray(row.reviews) ? row.reviews[0] : row.reviews) as
            { author_name: string | null; rating: number | null; text: string | null; review_date: string | null } | null;
        return {
            id: row.id as string, rating: row.rating as number | null, draftText: row.draft_text as string,
            source: row.source as "ai" | "template", status: row.status as "pending" | "failed",
            error: row.error as string | null, createdAt: row.created_at as string,
            review: review ? { authorName: review.author_name, rating: review.rating, text: review.text, reviewDate: review.review_date } : null,
        };
    });
}

export async function countPendingReplyDrafts(admin: SupabaseClient, businessId: string): Promise<number> {
    const { count } = await admin.from("review_reply_drafts").select("id", { count: "exact", head: true })
        .eq("business_id", businessId).in("status", ["pending", "failed"]);
    return count ?? 0;
}
