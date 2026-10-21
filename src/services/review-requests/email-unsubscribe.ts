import { z } from "zod";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { normalizeCustomerEmail } from "@/lib/customers/identity";
import { verifyUnsubscribe } from "@/lib/review-requests/unsubscribe-token";

/**
 * Review-request email unsubscribe. Scope: review-request email from this one business.
 * SMS (STOP) and unrelated transactional mail (e.g. a reply to the customer's own private
 * feedback) are separate and unaffected.
 */
const refSchema = z.object({ ref: z.uuid(), sig: z.string().min(40).max(64) });

export type UnsubscribeTarget = { requestId: string; businessId: string; businessName: string; email: string };

export async function resolveUnsubscribeTarget(ref: unknown, sig: unknown): Promise<UnsubscribeTarget | null> {
    const parsed = refSchema.safeParse({ ref, sig });
    if (!parsed.success) return null;
    const admin = createAdminClient();
    const { data } = await admin.from("review_requests")
        .select("id, business_id, customer_email, businesses(name)")
        .eq("id", parsed.data.ref).maybeSingle();
    if (!data || !verifyUnsubscribe(data.id, data.business_id, parsed.data.sig)) return null;
    const email = normalizeCustomerEmail(data.customer_email as string | null);
    if (!email) return null;
    const business = (Array.isArray(data.businesses) ? data.businesses[0] : data.businesses) as { name?: string | null } | null;
    return { requestId: data.id, businessId: data.business_id, businessName: business?.name || "this business", email };
}

export async function applyUnsubscribe(target: UnsubscribeTarget, source: "link" | "one_click"): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("review_request_email_unsubscribes")
        .upsert({ business_id: target.businessId, email: target.email, source }, { onConflict: "business_id,email", ignoreDuplicates: true });
    if (error) throw error;
    // Stop pending reminders to this address from this business right away.
    const { error: dripError } = await admin.from("review_requests")
        .update({ drip_status: "terminated", drip_terminated_reason: "unsubscribed" })
        .eq("business_id", target.businessId).ilike("customer_email", target.email).eq("drip_status", "active");
    if (dripError) throw dripError;
}
