import { logger } from "@/lib/logger";
import { emailHtmlToText } from "@/lib/email/html-to-text";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import { resendCollectratings } from "./collectratings-client";
import { buildFromLine, sendEmail } from "./send-email";

const DEFAULT_COLLECT_FROM = "CollectRatings <hello@send.collectratings.com>";

/**
 * We deliver on the business's behalf, so the display name is the business
 * (then the sender) on the verified CollectRatings mailbox.
 * e.g. "Willow Hair Studio <hello@send.collectratings.com>"
 */
export function collectratingsFromLine(businessName?: string | null, senderName?: string | null): string {
    const fallback = process.env.RESEND_COLLECTRATINGS_FROM?.trim() || DEFAULT_COLLECT_FROM;
    const display = (businessName || "").trim() || (senderName || "").trim();
    const mailbox = fallback.match(/<([^>]+)>/)?.[1];
    if (!display || !mailbox) return fallback;
    // No quotes/angle brackets/newlines so the header cannot break.
    return `${display.replace(/["<>\r\n]/g, "").slice(0, 78)} <${mailbox}>`;
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
 * Review-request mail only. Uses the CollectRatings Resend account so From
 * (`send.collectratings.com`) matches the capture-link domain (`collectratings.com`).
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
