import { createAdminClient } from "@/lib/db/supabase/admin";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

/** The persisted run ID is an opaque opt-out token; never expose recipient email. */
export async function activeGrowthEmailPreferences(sequence: string, email: string, organizationId?: string) {
    let query = createAdminClient().from("growth_email_runs").select("id, status")
        .eq("sequence_key", sequence).eq("recipient_email", email.toLowerCase());
    query = organizationId ? query.eq("organization_id", organizationId) : query.is("organization_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error("Unable to check product email preferences");
    if (!data || data.status !== "active") return null;
    const unsubscribeUrl = `${marketingCanonicalUrl("/api/marketing/product-email/unsubscribe")}?id=${data.id}`;
    return { unsubscribeUrl };
}
