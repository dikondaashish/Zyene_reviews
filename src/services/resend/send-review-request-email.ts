import { logger } from "@/lib/logger";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import { resendCollectratings } from "./collectratings-client";
import { buildFromLine, sendEmail } from "./send-email";

const DEFAULT_COLLECT_FROM = "CollectRatings <hello@send.collectratings.com>";

function getCollectratingsFrom(): string {
    return process.env.RESEND_COLLECTRATINGS_FROM?.trim() || DEFAULT_COLLECT_FROM;
}

type SendReviewRequestEmailProps = {
    to: string;
    subject: string;
    html: string;
    text?: string;
    /** Business mailbox so replies go to the merchant, not CollectRatings. */
    replyTo?: string | null;
    /**
     * Only used when `RESEND_COLLECTRATINGS_API_KEY` is unset (legacy Zyene From).
     * Prefer CollectRatings From once the second Resend account is configured.
     */
    fallbackSenderName?: string | null;
    fallbackBusinessName?: string | null;
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
}: SendReviewRequestEmailProps): Promise<{ sent: boolean; id?: string; error?: string }> {
    const apiKey = process.env.RESEND_COLLECTRATINGS_API_KEY?.trim();
    if (!apiKey || !resendCollectratings) {
        logger.warn(
            "RESEND_COLLECTRATINGS_API_KEY unset — falling back to primary Resend for review request"
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
        });
    }

    const replyList =
        typeof replyTo === "string" && replyTo.trim().length > 0 ? [replyTo.trim()] : [];

    try {
        const { data, error } = await resendCollectratings.emails.send({
            from: getCollectratingsFrom(),
            to,
            subject,
            html,
            ...(text ? { text } : {}),
            ...(replyList.length > 0 ? { reply_to: replyList } : {}),
            ...(Object.keys(REVIEW_REQUEST_EMAIL_HEADERS).length > 0
                ? { headers: REVIEW_REQUEST_EMAIL_HEADERS }
                : {}),
        });

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
