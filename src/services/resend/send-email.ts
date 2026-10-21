import { emailHtmlToText } from "@/lib/email/html-to-text";
import { EMAIL_BRAND } from "@/lib/email/email-brand";
import { logger } from "@/lib/logger";
import { resend } from "@/services/resend/client";
import { streamFrom, type EmailStream } from "@/services/resend/email-streams";

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
    /** Plain-text body improves deliverability (multipart/alternative). */
    text?: string;
    /**
     * Override the sender per-message. Must use a domain verified in Resend.
     * Example: `Wolfpack BBQ <notifications@zyenereviews.com>`.
     * If omitted, the `stream` sender is used.
     */
    from?: string;
    /** Which Zyene sender to use when `from` is omitted. Default: notifications. */
    stream?: EmailStream;
    /** Shown as Reply-To so the message reads as from the business, not bulk marketing. */
    replyTo?: string | string[];
    /** Custom MIME headers (e.g. Importance, Auto-Submitted). */
    headers?: Record<string, string>;
    /** An HTTPS endpoint that accepts RFC 8058 one-click POST requests. */
    unsubscribeUrl?: string;
    attachments?: Array<{ filename: string; content: string }>;
    /** Provider-side replay protection for an irreversible outbound email. */
    idempotencyKey?: string;
}

/**
 * `from` must use a domain verified in the Resend dashboard (or Resend’s test sender in dev).
 * Set `RESEND_FROM` to e.g. `Zyene Reviews <notifications@yourdomain.com>`.
 */
function getDefaultFrom(): string {
    return streamFrom("notifications");
}

/**
 * Build a per-business From line that reads like a person, while keeping the
 * verified Resend mailbox (e.g. `hello@zyenereviews.com`) so SPF/DKIM stay valid.
 *
 * Display-name precedence:
 *   1. `senderName` (e.g. owner first name like "Sam")
 *   2. `businessName` (e.g. "Wolfpack BBQ & Burgers")
 *   3. RESEND_FROM env / built-in default
 *
 * Result examples:
 *   buildFromLine({ senderName: "Sam", businessName: "Wolfpack BBQ" })
 *     → "Sam <hello@zyenereviews.com>"
 *   buildFromLine({ businessName: "Wolfpack BBQ" })
 *     → "Wolfpack BBQ <hello@zyenereviews.com>"
 *   buildFromLine({})
 *     → "Zyene Reviews <hello@zyenereviews.com>" (or whatever RESEND_FROM is)
 */
export function buildFromLine(input: { senderName?: string | null; businessName?: string | null }): string {
    const fallback = getDefaultFrom();
    const sender = (input.senderName || "").trim();
    const biz = (input.businessName || "").trim();
    const display = sender || biz;
    if (!display) return fallback;
    const match = fallback.match(/<([^>]+)>/);
    const mailbox = match ? match[1] : null;
    if (!mailbox) return fallback;
    // Sanitize display name (no quotes/angle brackets to avoid breaking the header).
    const safeName = display.replace(/["<>]/g, "").slice(0, 78);
    return `${safeName} <${mailbox}>`;
}

export async function sendEmail({ to, subject, html, text, from, stream, replyTo, headers, unsubscribeUrl, attachments, idempotencyKey }: SendEmailProps) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        logger.error("Resend API Key missing");
        return { sent: false, error: "RESEND_API_KEY is not set on the server" };
    }

    const sender = (from && from.trim()) || streamFrom(stream);
    // Marketing comes from a person, so replies go back to that person; the rest to support.
    const personalReply = stream === "marketing" ? sender.match(/<([^>]+)>/)?.[1] : undefined;
    const replyList =
        replyTo === undefined
            ? [personalReply || EMAIL_BRAND.support]
            : (Array.isArray(replyTo) ? replyTo : [replyTo]).filter((a) => typeof a === "string" && a.trim().length > 0);
    const replyToPayload = replyList.length > 0 ? { replyTo: replyList } : {};

    const messageHeaders = { ...headers, ...(unsubscribeUrl ? {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    } : {}) };
    const headersPayload = Object.keys(messageHeaders).length > 0 ? { headers: messageHeaders } : {};

    try {
        const { data, error } = await resend.emails.send({
            from: sender,
            to,
            subject,
            html,
            text: text || emailHtmlToText(html),
            ...(attachments?.length ? { attachments } : {}),
            ...replyToPayload,
            ...headersPayload,
        }, idempotencyKey ? { idempotencyKey } : undefined);

        if (error) {
            logger.error({ err: error }, "Resend Error:");
            return { sent: false, error: error.message };
        }

        if (data?.id) {
            logger.info({ id: data.id, to }, "[resend] Email accepted");
        }
        return { sent: true, id: data?.id };
    } catch (error: unknown) {
        logger.error({ err: error }, "Send Email Exception:");
        return {
            sent: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
