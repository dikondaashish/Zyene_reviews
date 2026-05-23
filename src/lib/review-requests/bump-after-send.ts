import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

function splitCustomerName(customerName: string | null | undefined): {
    first: string | null;
    last: string | null;
} {
    const parts = (customerName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first: null, last: null };
    if (parts.length === 1) return { first: parts[0] ?? null, last: null };
    return { first: parts[0] ?? null, last: parts.slice(1).join(" ") || null };
}

export type BumpAfterSendLegs = { phone: boolean; email: boolean };

/** After a successful send: bump customer counters (works with service-role client). */
export async function bumpCustomerAfterSend(
    supabase: SupabaseClient,
    businessId: string,
    customerName: string | null | undefined,
    phone: string | null,
    email: string | null,
    /** When set (e.g. channel "both" partial success), only bump legs that actually sent. */
    legs?: BumpAfterSendLegs,
) {
    const { first: pFirst, last: pLast } = splitCustomerName(customerName ?? undefined);

    const bumpPhone = legs ? legs.phone : true;
    const bumpEmail = legs ? legs.email : true;

    const digits = (phone || "").replace(/\D/g, "");
    if (bumpPhone && phone && digits.length >= 10) {
        await supabase.rpc("increment_customer_requests", {
            p_business_id: businessId,
            p_phone: phone,
            p_first_name: pFirst,
            p_last_name: pLast,
        });
    }

    if (bumpEmail && email) {
        const { data: row } = await supabase
            .from("customers")
            .select("id, total_requests_sent, first_name, last_name")
            .eq("business_id", businessId)
            .eq("email", email)
            .maybeSingle();

        const nextTotal = (row?.total_requests_sent ?? 0) + 1;
        const patch = {
            total_requests_sent: nextTotal,
            last_request_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            first_name: pFirst ?? row?.first_name ?? null,
            last_name: pLast ?? row?.last_name ?? null,
        };

        if (row?.id) {
            await supabase.from("customers").update(patch).eq("id", row.id);
        } else {
            const { error: insErr } = await supabase.from("customers").insert({
                business_id: businessId,
                email,
                phone: null,
                first_name: pFirst,
                last_name: pLast,
                tags: [],
                total_requests_sent: 1,
                last_request_sent_at: new Date().toISOString(),
            });
            if (insErr) {
                logger.error({ err: insErr }, "[bump-after-send] customer insert (email)");
            }
        }
    }
}
