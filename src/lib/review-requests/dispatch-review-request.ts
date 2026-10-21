import type { SupabaseClient } from "@supabase/supabase-js";
import { blockedReason, checkReviewRequestSend, type GuardChannel } from "@/lib/review-requests/send-guard";
import { deliverReviewRequestEmail, deliverReviewRequestSms, type DeliverOutcome } from "@/lib/review-requests/deliver-message";
import type { BumpAfterSendLegs } from "./bump-after-send";

/**
 * The one guarded send used by every customer-facing review-request path.
 * 1. Re-checks channel switches, opt-outs, unsubscribes, test tags and the frequency cap.
 * 2. Returns "deferred" during the business's quiet hours (caller re-queues).
 * 3. Sends each allowed channel through the per-message claim (no double sends).
 */
export type LegStatus = "sent" | "failed" | "skipped";
export type DispatchResult = {
    sendStatus: "sent" | "failed" | "skipped" | "deferred";
    deferUntil: Date | null;
    errorMessage: string | null;
    resendEmailId: string | null;
    smsLegStatus: LegStatus | null;
    emailLegStatus: LegStatus | null;
    bumpLegs?: BumpAfterSendLegs;
};

export type DispatchInput = {
    requestId: string;
    businessId: string;
    step: 1 | 2 | 3;
    channels: GuardChannel[];
    phone: string | null;
    email: string | null;
    frequencyCap: "apply" | "skip";
    sms?: { body: string };
    emailMessage?: { subject: string; html: string; text?: string; replyTo?: string | null };
    senderName?: string | null;
    businessName?: string | null;
    now?: Date;
};

function legFromOutcome(outcome: DeliverOutcome): { leg: LegStatus; note: string | null } {
    if (outcome.status === "sent") return { leg: "sent", note: null };
    if (outcome.status === "failed") return { leg: "failed", note: outcome.error };
    // Claimed by an earlier attempt: never send it again.
    if (outcome.previous === "failed") return { leg: "failed", note: "Earlier attempt failed" };
    if (outcome.previous === "claimed" || outcome.previous === "unknown") {
        return { leg: "skipped", note: "Another attempt is in progress or its result is unknown; not resent" };
    }
    // Provider already accepted this exact message (retry after a crash): record it as sent.
    return { leg: "sent", note: "Already sent earlier; not resent" };
}

export async function dispatchReviewRequest(admin: SupabaseClient, input: DispatchInput): Promise<DispatchResult> {
    const guard = await checkReviewRequestSend(admin, {
        businessId: input.businessId, channels: input.channels, phone: input.phone, email: input.email,
        frequencyCap: input.frequencyCap, now: input.now,
    });
    const base = { resendEmailId: null, smsLegStatus: null, emailLegStatus: null } as const;
    if (!guard.allowed.length) {
        return { ...base, sendStatus: "skipped", deferUntil: null, errorMessage: blockedReason(guard.blocked),
            smsLegStatus: input.channels.includes("sms") ? "skipped" : null,
            emailLegStatus: input.channels.includes("email") ? "skipped" : null };
    }
    if (guard.deferUntil) {
        return { ...base, sendStatus: "deferred", deferUntil: guard.deferUntil, errorMessage: "Quiet hours" };
    }

    const notes: string[] = guard.blocked.map((b) => `${b.channel.toUpperCase()} skipped: ${b.reason}`);
    let smsLegStatus: LegStatus | null = input.channels.includes("sms") ? "skipped" : null;
    let emailLegStatus: LegStatus | null = input.channels.includes("email") ? "skipped" : null;
    let resendEmailId: string | null = null;
    const common = { requestId: input.requestId, businessId: input.businessId, step: input.step };

    if (guard.allowed.includes("sms") && input.phone && input.sms) {
        const { leg, note } = legFromOutcome(await deliverReviewRequestSms(admin, { ...common, to: input.phone, body: input.sms.body }));
        smsLegStatus = leg;
        if (note) notes.push(`SMS: ${note}`);
    }
    if (guard.allowed.includes("email") && input.email && input.emailMessage) {
        const outcome = await deliverReviewRequestEmail(admin, {
            ...common, to: input.email, ...input.emailMessage, senderName: input.senderName, businessName: input.businessName,
        });
        const { leg, note } = legFromOutcome(outcome);
        emailLegStatus = leg;
        if (outcome.status === "sent") resendEmailId = outcome.providerMessageId;
        if (note) notes.push(`Email: ${note}`);
    }

    const anySent = smsLegStatus === "sent" || emailLegStatus === "sent";
    const anyFailed = smsLegStatus === "failed" || emailLegStatus === "failed";
    return {
        sendStatus: anySent ? "sent" : anyFailed ? "failed" : "skipped",
        deferUntil: null,
        errorMessage: notes.length ? notes.join(". ") : null,
        resendEmailId,
        smsLegStatus,
        emailLegStatus,
        bumpLegs: anySent ? { phone: smsLegStatus === "sent", email: emailLegStatus === "sent" } : undefined,
    };
}

/** Maps a request channel ("sms" | "email" | "both") to guard channels. */
export function channelsFor(channel: string): GuardChannel[] {
    if (channel === "both") return ["sms", "email"];
    return channel === "sms" || channel === "email" ? [channel] : [];
}
