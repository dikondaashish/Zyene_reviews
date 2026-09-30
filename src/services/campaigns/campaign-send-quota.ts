import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { checkLimit } from "@/lib/stripe/check-limits";

/** Called only after writable live business access has been established. */
export async function checkCampaignAudienceQuota(
    client: SupabaseClient<Database>, businessId: string, channel: string,
    contacts: { phone?: string | null; email?: string | null }[],
): Promise<boolean> {
    const { data: business, error } = await client.from("businesses")
        .select("organization_id").eq("id", businessId).single();
    if (error || !business?.organization_id) return false;
    for (const method of ["sms", "email"] as const) {
        if (channel !== method && channel !== "both") continue;
        const needed = contacts.filter(contact => method === "sms" ? contact.phone : contact.email).length;
        if (needed === 0) continue;
        const quota = await checkLimit(business.organization_id, `${method}_requests`);
        if (!quota.allowed || (quota.max !== -1 && quota.remaining < needed)) return false;
    }
    return true;
}
