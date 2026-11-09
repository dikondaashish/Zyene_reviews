import type { createAdminClient } from "@/lib/db/supabase/admin";

type LeadRow = {
    email: string;
    source: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
};

/**
 * Records a lead from a public form in marketing_subscribers without ever
 * re-subscribing someone who unsubscribed (CAN-SPAM; anyone can type any address):
 * - new address: inserted;
 * - still subscribed: source/UTM/subscribed_at refreshed, as before, so the growth
 *   KPIs that count rows by source (e.g. demo requests) keep counting returning leads;
 * - unsubscribed: left untouched.
 */
export async function recordLeadSubscriber(
    admin: ReturnType<typeof createAdminClient>,
    row: LeadRow,
): Promise<{ error: { message?: string; code?: string } | null }> {
    const { data: existing, error: readError } = await admin
        .from("marketing_subscribers")
        .select("id, unsubscribed_at")
        .eq("email", row.email)
        .maybeSingle();
    if (readError) return { error: readError };

    const now = new Date().toISOString();
    if (!existing) {
        const { error } = await admin.from("marketing_subscribers").insert({ ...row, subscribed_at: now });
        // Lost a race with another form for the same address: it exists now, which is all we need.
        return { error: error && error.code !== "23505" ? error : null };
    }
    if (existing.unsubscribed_at) return { error: null };

    const { error } = await admin
        .from("marketing_subscribers")
        .update({ ...row, subscribed_at: now })
        .eq("id", existing.id)
        .is("unsubscribed_at", null);
    return { error };
}
