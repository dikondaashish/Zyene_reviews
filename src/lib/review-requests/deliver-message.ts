import type { SupabaseClient } from "@supabase/supabase-js";
import { sendSMS } from "@/services/twilio/send-sms";
import { sendReviewRequestEmail } from "@/services/resend/send-review-request-email";
import { claimReviewRequestMessage, recordMessageResult } from "@/lib/review-requests/message-ledger";
import { unsubscribeUrl } from "@/lib/review-requests/unsubscribe-token";
import { escapeHtml } from "@/lib/security/html-escape";
import { EMAIL_COLORS } from "@/lib/email/transactional-email-styles";

/**
 * Provider call for one review-request message, wrapped in the per-message send claim.
 * Every customer-facing review-request path sends through here so retries and
 * overlapping workers cannot double-send, provider ids are kept for delivery callbacks,
 * and every email carries a signed unsubscribe link.
 */
export type DeliverOutcome =
    | { status: "sent"; providerMessageId: string | null }
    | { status: "failed"; error: string }
    | { status: "duplicate"; previous: string };

type Common = { requestId: string; businessId: string; step: 1 | 2 | 3 };

export function twilioStatusCallbackUrl(): string | undefined {
    const explicit = process.env.TWILIO_STATUS_CALLBACK_URL?.trim();
    if (explicit) return explicit;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    // Twilio cannot reach localhost; only register callbacks for public HTTPS hosts.
    return appUrl?.startsWith("https://") ? `${appUrl}/api/webhooks/twilio/status` : undefined;
}

export async function deliverReviewRequestSms(admin: SupabaseClient, args: Common & { to: string; body: string }): Promise<DeliverOutcome> {
    const claim = await claimReviewRequestMessage(admin, { ...args, channel: "sms" });
    if (claim.outcome === "duplicate") return { status: "duplicate", previous: claim.status };
    const result = await sendSMS(args.to, args.body, { statusCallback: twilioStatusCallbackUrl() });
    await recordMessageResult(admin, claim.messageId, { sent: result.sent, providerMessageId: result.sid, error: result.error });
    return result.sent ? { status: "sent", providerMessageId: result.sid ?? null } : { status: "failed", error: result.error || "SMS failed" };
}

/** Visible unsubscribe link in the body (the List-Unsubscribe header alone is not shown by every client). */
export function withUnsubscribeFooter(html: string, text: string | undefined, url: string, businessName?: string | null) {
    const who = businessName ? ` from ${escapeHtml(businessName)}` : "";
    const footer = `<p style="font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};margin:16px 0 0">Don't want review requests${who}? <a href="${escapeHtml(url)}" style="color:${EMAIL_COLORS.muted}">Unsubscribe</a></p>`;
    const htmlOut = /<\/body>/i.test(html) ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${footer}</body>`) : `${html}${footer}`;
    const textOut = `${text ?? ""}\n\nUnsubscribe from review requests: ${url}`.trim();
    return { html: htmlOut, text: textOut };
}

export async function deliverReviewRequestEmail(admin: SupabaseClient, args: Common & {
    to: string; subject: string; html: string; text?: string; replyTo?: string | null;
    senderName?: string | null; businessName?: string | null;
}): Promise<DeliverOutcome> {
    const claim = await claimReviewRequestMessage(admin, { ...args, channel: "email" });
    if (claim.outcome === "duplicate") return { status: "duplicate", previous: claim.status };
    const unsubscribe = unsubscribeUrl(args.requestId, args.businessId);
    const body = withUnsubscribeFooter(args.html, args.text, unsubscribe, args.businessName);
    const result = await sendReviewRequestEmail({
        to: args.to, subject: args.subject, html: body.html, text: body.text, replyTo: args.replyTo,
        fallbackSenderName: args.senderName, fallbackBusinessName: args.businessName,
        unsubscribeUrl: unsubscribe,
        // Same key for retries of the same message: Resend dedupes within 24h.
        idempotencyKey: `review-request/${args.requestId}/step-${args.step}`,
    });
    await recordMessageResult(admin, claim.messageId, { sent: result.sent, providerMessageId: result.id, error: result.error });
    if (result.sent && result.id && args.step === 1) {
        await admin.from("review_requests").update({ resend_email_id: result.id })
            .eq("id", args.requestId).eq("business_id", args.businessId);
    }
    return result.sent ? { status: "sent", providerMessageId: result.id ?? null } : { status: "failed", error: result.error || "Email failed" };
}
