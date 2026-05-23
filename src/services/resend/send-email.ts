import { logger } from "@/lib/logger";
import { resend } from "./client";

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
    /** Plain-text body improves deliverability (multipart/alternative). */
    text?: string;
    /**
     * Override the sender per-message. Must use a domain verified in Resend.
     * Example: `Wolfpack BBQ <notifications@zyenereviews.com>`.
     * If omitted, falls back to RESEND_FROM env / default brand sender.
     */
    from?: string;
    /** Shown as Reply-To so the message reads as from the business, not bulk marketing. */
    replyTo?: string | string[];
    /** Custom MIME headers (e.g. Importance, Auto-Submitted). */
    headers?: Record<string, string>;
}

/**
 * `from` must use a domain verified in the Resend dashboard (or Resend’s test sender in dev).
 * Set `RESEND_FROM` to e.g. `Zyene Reviews <notifications@yourdomain.com>`.
 */
function getDefaultFrom(): string {
    const configured = process.env.RESEND_FROM?.trim();
    if (configured) return configured;
    return "Zyene Reviews <notifications@zyenereviews.com>";
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
export function buildFromLine(input: {
    senderName?: string | null;
    businessName?: string | null;
}): string {
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

export async function sendEmail({ to, subject, html, text, from, replyTo, headers }: SendEmailProps) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        logger.error("Resend API Key missing");
        return { sent: false, error: "RESEND_API_KEY is not set on the server" };
    }

    const replyList =
        replyTo === undefined
            ? []
            : (Array.isArray(replyTo) ? replyTo : [replyTo]).filter((a) => typeof a === "string" && a.trim().length > 0);
    const replyToPayload = replyList.length > 0 ? { reply_to: replyList } : {};

    const headersPayload =
        headers && Object.keys(headers).length > 0 ? { headers } : {};

    try {
        const { data, error } = await resend.emails.send({
            from: (from && from.trim()) || getDefaultFrom(),
            to,
            subject,
            html,
            ...(text ? { text } : {}),
            ...replyToPayload,
            ...headersPayload,
        });

        if (error) {
            logger.error({ err: error }, "Resend Error:");
            return { sent: false, error: error.message };
        }

        if (data?.id) {
            console.info("[resend] Email accepted", { id: data.id, to });
        }
        return { sent: true, id: data?.id };
    } catch (error: unknown) {
        logger.error({ err: error }, "Send Email Exception:");
        return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
