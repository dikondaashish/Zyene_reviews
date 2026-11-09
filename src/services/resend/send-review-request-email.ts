import { logger } from "@/lib/logger";
import { emailHtmlToText } from "@/lib/email/html-to-text";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import { resendCollectratings } from "./collectratings-client";
import { reviewRequestFromLine, type ReviewRequestSender } from "@/lib/email/review-request-from-line";
import { buildFromLine, sendEmail } from "./send-email";
import { streamFrom } from "./email-streams";

const DEFAULT_COLLECT_FROM = "CollectRatings <hello@send.collectratings.com>";

/**
 * We deliver on the business's behalf, so the sender reads as the business:
 * "Sam at Willow Hair Studio <willow-hair-studio@send.collectratings.com>", or just
 * the business name when no sender is set. The domain comes from RESEND_COLLECTRATINGS_FROM.
 */
export function collectratingsFromLine(businessName?: string | null, senderName?: string | null): string {
    const from = process.env.RESEND_COLLECTRATINGS_FROM?.trim() || DEFAULT_COLLECT_FROM;
    return reviewRequestFromLine({ kind: "collect", from }, businessName, senderName);
}

/** The account and From line review requests go out on right now (for the settings preview). */
export function reviewRequestSender(): ReviewRequestSender {
    if (process.env.RESEND_COLLECTRATINGS_API_KEY?.trim() && resendCollectratings) {
        return { kind: "collect", from: process.env.RESEND_COLLECTRATINGS_FROM?.trim() || DEFAULT_COLLECT_FROM };
    }
    return { kind: "primary", from: streamFrom("notifications") };
}

type SendReviewRequestEmailProps = {
    to: string;
    subject: string;
    html: string;
    text?: string;
    /** Business mailbox so replies go to the merchant, not CollectRatings. */
    replyTo?: string | null;
    /** From display name: business first, then sender (both accounts). */
    fallbackSenderName?: string | null;
    fallbackBusinessName?: string | null;
    /** Signed per-request unsubscribe URL (adds List-Unsubscribe + one-click headers). */
    unsubscribeUrl?: string;
    /** Provider idempotency key so a retried job cannot send the same email twice. */
    idempotencyKey?: string;
};

/**
 * Mail to a business's customers, sent on the business's behalf: review requests
 * and the private-feedback recovery letter. Uses the CollectRatings Resend account so
 * From (`send.collectratings.com`) matches the capture-link domain (`collectratings.com`).
 * All other product mail stays on `sendEmail` / `RESEND_API_KEY`.
 */
export async function sendReviewRequestEmail({
    to,
    subject,
    html,
    text,
    replyTo,
    fallbackSenderName,
    fallbackBusinessName,
    unsubscribeUrl,
    idempotencyKey,
}: SendReviewRequestEmailProps): Promise<{ sent: boolean; id?: string; error?: string }> {
    const apiKey = process.env.RESEND_COLLECTRATINGS_API_KEY?.trim();
    if (!apiKey || !resendCollectratings) {
        logger.warn(
            "RESEND_COLLECTRATINGS_API_KEY unset - falling back to primary Resend for review request"
        );
        return sendEmail({
            to,
            subject,
            html,
            text,
            from: buildFromLine({
                senderName: fallbackSenderName,
                businessName: fallbackBusinessName,
            }),
            replyTo: replyTo ?? undefined,
            headers: REVIEW_REQUEST_EMAIL_HEADERS,
            unsubscribeUrl,
            idempotencyKey,
        });
    }

    const replyList =
        typeof replyTo === "string" && replyTo.trim().length > 0 ? [replyTo.trim()] : [];

    const headers = {
        ...REVIEW_REQUEST_EMAIL_HEADERS,
        ...(unsubscribeUrl ? {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        } : {}),
    };

    try {
        const { data, error } = await resendCollectratings.emails.send({
            from: collectratingsFromLine(fallbackBusinessName, fallbackSenderName),
            to,
            subject,
            html,
            text: text || emailHtmlToText(html),
            ...(replyList.length > 0 ? { replyTo: replyList } : {}),
            ...(Object.keys(headers).length > 0 ? { headers } : {}),
        }, idempotencyKey ? { idempotencyKey } : undefined);

        if (error) {
            logger.error({ err: error }, "[resend-collect] Review request failed");
            return { sent: false, error: error.message };
        }

        if (data?.id) {
            logger.info({ id: data.id, to }, "[resend-collect] Review request accepted");
        }
        return { sent: true, id: data?.id };
    } catch (err: unknown) {
        logger.error({ err }, "[resend-collect] Review request exception");
        return {
            sent: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
