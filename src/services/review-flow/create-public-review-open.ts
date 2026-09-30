import { createAdminClient } from "@/lib/db/supabase/admin";
import { signReviewTracking } from "@/lib/review-requests/tracking-token";

export async function createPublicReviewOpen(businessId: string) {
    const nowIso = new Date().toISOString();
    const supabase = createAdminClient();
    const baseInsert = {
        business_id: businessId,
        status: "clicked",
        sent_at: nowIso,
        delivered_at: nowIso,
        opened_at: nowIso,
        clicked_at: nowIso,
    };

    const primary = await supabase
        .from("review_requests")
        .insert({ ...baseInsert, channel: "link", trigger_source: "public_link" })
        .select("id")
        .single();

    const fallback = primary.data ? null : await supabase
        .from("review_requests")
        .insert({ ...baseInsert, channel: "email", trigger_source: "manual" })
        .select("id")
        .single();

    const created = primary.data ?? fallback?.data;
    if (!created) throw fallback?.error ?? primary.error ?? new Error("Failed to create request");

    return {
        requestId: created.id,
        token: signReviewTracking(created.id, businessId),
    };
}
