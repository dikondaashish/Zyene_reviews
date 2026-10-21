import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParsedAddress } from "@/lib/enrollment/inbound-email-parse";

/** Team member and business addresses: never enrolled even if they appear as recipients. */
export async function excludedStaffEmails(admin: SupabaseClient, businessId: string): Promise<string[]> {
    const { data: business } = await admin.from("businesses").select("organization_id, email").eq("id", businessId).maybeSingle();
    if (!business) return [];
    const [{ data: orgMembers }, { data: members }] = await Promise.all([
        admin.from("organization_members").select("users(email)").eq("organization_id", business.organization_id),
        admin.from("business_members").select("users(email)").eq("business_id", businessId),
    ]);
    const emails = [...(orgMembers ?? []), ...(members ?? [])].map((row) => {
        const user = (Array.isArray(row.users) ? row.users[0] : row.users) as { email?: string | null } | null;
        return user?.email?.toLowerCase() ?? null;
    });
    if (business.email) emails.push(String(business.email).toLowerCase());
    return [...new Set(emails.filter(Boolean) as string[])];
}

/** The campaign's always-open inbound enrollment stream (created on first use). */
async function inboundStream(admin: SupabaseClient, businessId: string, campaignId: string, ownerId: string) {
    const { data: existing } = await admin.from("enrollment_imports").select("id, status")
        .eq("campaign_id", campaignId).eq("business_id", businessId).eq("source", "inbound_email").maybeSingle();
    if (existing) return existing as { id: string; status: string };
    const now = new Date().toISOString();
    const { data, error } = await admin.from("enrollment_imports").insert({
        business_id: businessId, campaign_id: campaignId, source: "inbound_email", status: "active", daily_limit: 50,
        created_by: ownerId, consent_confirmed_by: ownerId, consent_confirmed_at: now,
    }).select("id, status").single();
    if (error?.code === "23505") return inboundStream(admin, businessId, campaignId, ownerId);
    if (error) throw error;
    return data as { id: string; status: string };
}

/**
 * Queue invoice recipients for gradual enrollment. Returns how many were newly queued; a
 * contact already queued or enrolled in this stream is not added again.
 */
export async function enqueueInboundContacts(admin: SupabaseClient, args: {
    businessId: string; campaignId: string; ownerId: string | null; contacts: ParsedAddress[];
}): Promise<number> {
    if (!args.ownerId) return 0;
    const { data: campaign } = await admin.from("campaigns").select("id, status")
        .eq("id", args.campaignId).eq("business_id", args.businessId).maybeSingle();
    if (!campaign || ["archived", "completed"].includes(campaign.status as string)) return 0;
    const stream = await inboundStream(admin, args.businessId, args.campaignId, args.ownerId);
    if (stream.status === "cancelled" || stream.status === "completed") return 0;

    const { data: last } = await admin.from("enrollment_import_rows").select("row_number")
        .eq("import_id", stream.id).order("row_number", { ascending: false }).limit(1).maybeSingle();
    let rowNumber = ((last?.row_number as number | undefined) ?? 0) + 1;
    let queued = 0;
    for (const contact of args.contacts) {
        const { error } = await admin.from("enrollment_import_rows").insert({
            import_id: stream.id, business_id: args.businessId, row_number: rowNumber++, customer_name: contact.name,
            email: contact.email, identity_key: contact.email, status: "pending",
        });
        if (error?.code === "23505") continue; // already queued/enrolled from an earlier invoice
        if (error) throw error;
        queued++;
    }
    if (queued) {
        const { count } = await admin.from("enrollment_import_rows").select("id", { count: "exact", head: true }).eq("import_id", stream.id);
        await admin.from("enrollment_imports").update({ total_rows: count ?? 0, valid_rows: count ?? 0, updated_at: new Date().toISOString() }).eq("id", stream.id);
    }
    return queued;
}
