import type { SupabaseClient } from "@supabase/supabase-js";
import { applyDeliveryEvent } from "@/lib/review-requests/message-ledger";
import { normalizeCustomerEmail } from "@/lib/customers/identity";

/**
 * Applies one Resend email event to review-request facts. Request-level status only
 * moves forward (sent -> delivered -> opened -> clicked); a bounce never overwrites a
 * request the customer already clicked or completed. Hard bounces and spam complaints
 * suppress future review-request email to that address for the business.
 */
export type ResendFact = "delivered" | "opened" | "clicked" | "bounced" | "complained";

const FORWARD_FROM: Record<string, string[]> = {
    delivered: ["sent"],
    opened: ["sent", "delivered"],
    clicked: ["sent", "delivered", "opened"],
};

export function resendFact(type: string): ResendFact | null {
    const t = type.replace(/^email\./, "");
    return (["delivered", "opened", "clicked", "bounced", "complained"] as const).find((f) => f === t) ?? null;
}

export function isHardBounce(data: Record<string, unknown> | undefined): boolean {
    const bounce = data?.bounce as Record<string, unknown> | undefined;
    const kind = String(bounce?.type ?? "").toLowerCase();
    return kind !== "transient" && kind !== "soft";
}

async function requestIdsFor(admin: SupabaseClient, emailId: string, fact: ResendFact, reason: string | null) {
    const ledgerStatus = fact === "opened" || fact === "clicked" ? null : fact;
    const ledger = ledgerStatus
        ? await applyDeliveryEvent(admin, { channel: "email", providerMessageId: emailId, status: ledgerStatus, reason })
        : null;
    if (ledger) return [{ id: ledger.review_request_id, business_id: ledger.business_id }];
    const { data: viaMessage } = await admin.from("review_request_messages").select("review_request_id, business_id")
        .eq("channel", "email").eq("provider_message_id", emailId).limit(1);
    if (viaMessage?.length) return viaMessage.map((m) => ({ id: m.review_request_id as string, business_id: m.business_id as string }));
    const { data: legacy } = await admin.from("review_requests").select("id, business_id").eq("resend_email_id", emailId).limit(5);
    return (legacy ?? []) as { id: string; business_id: string }[];
}

export async function applyResendFact(admin: SupabaseClient, args: {
    emailId: string; fact: ResendFact; data?: Record<string, unknown>;
}): Promise<number> {
    const reason = typeof args.data?.error === "string" ? args.data.error
        : typeof (args.data?.bounce as Record<string, unknown> | undefined)?.message === "string"
            ? String((args.data?.bounce as Record<string, unknown>).message) : null;
    const requests = await requestIdsFor(admin, args.emailId, args.fact, reason);
    const now = new Date().toISOString();
    for (const req of requests) {
        const scoped = () => admin.from("review_requests");
        if (args.fact === "delivered") {
            await scoped().update({ delivered_at: now, email_status: "delivered" }).eq("id", req.id).eq("business_id", req.business_id).in("email_status", ["sent"]);
        } else if (args.fact === "opened") {
            await scoped().update({ opened_at: now }).eq("id", req.id).eq("business_id", req.business_id).is("opened_at", null);
        } else if (args.fact === "clicked") {
            await scoped().update({ clicked_at: now }).eq("id", req.id).eq("business_id", req.business_id).is("clicked_at", null);
        }
        if (FORWARD_FROM[args.fact]) {
            await scoped().update({ status: args.fact }).eq("id", req.id).eq("business_id", req.business_id).in("status", FORWARD_FROM[args.fact]);
        }
        if (args.fact === "bounced" || args.fact === "complained") {
            await scoped().update({ email_status: args.fact, error_message: args.fact === "bounced" ? `Email bounced${reason ? `: ${reason}` : ""}` : "Recipient marked the email as spam" })
                .eq("id", req.id).eq("business_id", req.business_id);
            await scoped().update({ status: "failed" }).eq("id", req.id).eq("business_id", req.business_id)
                .eq("channel", "email").in("status", ["sent", "delivered"]);
            if (args.fact === "complained" || isHardBounce(args.data)) await suppressEmail(admin, req, args.fact === "complained" ? "complaint" : "bounce");
        }
    }
    return requests.length;
}

async function suppressEmail(admin: SupabaseClient, req: { id: string; business_id: string }, source: "bounce" | "complaint") {
    const { data } = await admin.from("review_requests").select("customer_email").eq("id", req.id).eq("business_id", req.business_id).maybeSingle();
    const email = normalizeCustomerEmail(data?.customer_email as string | null | undefined);
    if (!email) return;
    await admin.from("review_request_email_unsubscribes")
        .upsert({ business_id: req.business_id, email, source }, { onConflict: "business_id,email", ignoreDuplicates: true });
}
