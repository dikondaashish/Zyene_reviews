import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * review_request_messages is the send claim for each intended message
 * (request x step x channel). Inserting the row before the provider call means a retried
 * job or an overlapping worker cannot send the same message twice.
 *
 * Claim outcomes:
 * - "claimed": this caller owns the send.
 * - "duplicate": already sent, or another worker holds it. Never resend.
 * A claim whose earlier attempt failed before reaching the provider (status "failed",
 * no provider id) may be re-claimed, because nothing was sent.
 */
export type LedgerChannel = "sms" | "email";
export type ClaimResult = { outcome: "claimed"; messageId: string } | { outcome: "duplicate"; status: string };

/** Higher rank wins; callbacks with a lower or equal rank are ignored (out-of-order safe). */
export const DELIVERY_RANK: Record<string, number> = {
    claimed: 0, skipped: 0, sent: 1, delivered: 2, failed: 3, undelivered: 3, bounced: 3, complained: 4,
};

export async function claimReviewRequestMessage(admin: SupabaseClient, args: {
    requestId: string; businessId: string; step: 1 | 2 | 3; channel: LedgerChannel;
}): Promise<ClaimResult> {
    const { data, error } = await admin.from("review_request_messages").insert({
        review_request_id: args.requestId, business_id: args.businessId, step: args.step, channel: args.channel,
        status: "claimed", status_rank: 0,
    }).select("id").single();
    if (data?.id) return { outcome: "claimed", messageId: data.id };
    if (error && error.code !== "23505") throw error;

    const { data: existing, error: readError } = await admin.from("review_request_messages")
        .select("id, status, provider_message_id")
        .eq("review_request_id", args.requestId).eq("step", args.step).eq("channel", args.channel).maybeSingle();
    if (readError) throw readError;
    if (!existing) return { outcome: "duplicate", status: "unknown" };
    if (existing.status === "failed" && !existing.provider_message_id) {
        const { data: reclaimed, error: reclaimError } = await admin.from("review_request_messages")
            .update({ status: "claimed", status_rank: 0, reason: null, updated_at: new Date().toISOString() })
            .eq("id", existing.id).eq("status", "failed").is("provider_message_id", null)
            .select("id").maybeSingle();
        if (reclaimError) throw reclaimError;
        if (reclaimed?.id) return { outcome: "claimed", messageId: reclaimed.id };
    }
    return { outcome: "duplicate", status: existing.status };
}

export async function recordMessageResult(admin: SupabaseClient, messageId: string, result: {
    sent: boolean; providerMessageId?: string | null; error?: string | null;
}): Promise<void> {
    const now = new Date().toISOString();
    const patch = result.sent
        ? { status: "sent", status_rank: DELIVERY_RANK.sent, provider_message_id: result.providerMessageId ?? null,
            sent_at: now, last_event_at: now, reason: null }
        : { status: "failed", status_rank: DELIVERY_RANK.failed, failed_at: now, last_event_at: now,
            reason: (result.error || "Provider rejected the message").slice(0, 500) };
    const { error } = await admin.from("review_request_messages")
        .update({ ...patch, updated_at: now }).eq("id", messageId).eq("status", "claimed");
    if (error) throw error;
}

/**
 * Applies a provider delivery event (Twilio status callback, Resend webhook). Duplicate and
 * out-of-order events are ignored by rank; returns the row when it changed.
 */
export async function applyDeliveryEvent(admin: SupabaseClient, args: {
    channel: LedgerChannel; providerMessageId: string; status: keyof typeof DELIVERY_RANK; reason?: string | null; at?: Date;
}): Promise<{ id: string; review_request_id: string; business_id: string; status: string } | null> {
    const rank = DELIVERY_RANK[args.status];
    if (rank === undefined || rank < DELIVERY_RANK.sent) return null;
    const at = (args.at ?? new Date()).toISOString();
    const patch: Record<string, unknown> = { status: args.status, status_rank: rank, last_event_at: at, updated_at: new Date().toISOString() };
    if (args.status === "delivered") patch.delivered_at = at;
    if (rank >= DELIVERY_RANK.failed) { patch.failed_at = at; patch.reason = (args.reason || args.status).slice(0, 500); }
    const { data, error } = await admin.from("review_request_messages").update(patch)
        .eq("channel", args.channel).eq("provider_message_id", args.providerMessageId).lt("status_rank", rank)
        .select("id, review_request_id, business_id, status").maybeSingle();
    if (error) throw error;
    return data ?? null;
}
