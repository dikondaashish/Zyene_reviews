/**
 * Google Q&A availability checks for the active business.
 *
 * Plain module, not a server action: business-context.ts owns the "use server"
 * boundary and exposes these through thin async wrappers.
 */

import { createClient } from "@/lib/db/supabase/server";

/**
 * Live read of `review_platforms.google_qa_unavailable` for the Google row.
 * Prefer this over `business.review_platforms` from {@link getActiveBusinessId} because that payload can be Redis-cached for several minutes.
 */
export async function readGoogleQaUnavailable(businessId: string | null): Promise<boolean> {
    if (!businessId) return false;
    const supabase = await createClient();
    const { data } = await supabase
        .from("review_platforms")
        .select("google_qa_unavailable")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    return data?.google_qa_unavailable === true;
}

/**
 * Whether the dashboard sidebar should show the Google Q&A (/questions) nav item.
 * Visible only when the business has at least one `gbp_questions` row and the Google platform
 * has a Q&A sync watermark (`google_qa_synced_at`), so first visit / in-flight phase2 stays hidden
 * without a "Syncing…" placeholder in the nav.
 */
export async function readGoogleQaSidebarNavVisible(businessId: string | null): Promise<boolean> {
    if (!businessId) return false;
    const supabase = await createClient();
    const { data: platform, error: platformError } = await supabase
        .from("review_platforms")
        .select("google_qa_synced_at")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    if (platformError || !platform) return false;

    const { count, error: countError } = await supabase
        .from("gbp_questions")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId);
    if (countError) return false;
    const n = count ?? 0;
    if (n < 1) return false;

    return platform.google_qa_synced_at != null;
}
