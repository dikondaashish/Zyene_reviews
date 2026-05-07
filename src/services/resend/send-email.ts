import { resend } from "./client";

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
    /** Plain-text body improves deliverability (multipart/alternative). */
    text?: string;
    /** Shown as Reply-To so the message reads as from the business, not bulk marketing. */
    replyTo?: string | string[];
    /** Custom MIME headers (e.g. Importance, Auto-Submitted). */
    headers?: Record<string, string>;
}

/**
 * `from` must use a domain verified in the Resend dashboard (or Resend’s test sender in dev).
 * Set `RESEND_FROM` to e.g. `Zyene Reviews <notifications@yourdomain.com>`.
 */
function getResendFrom(): string {
    const configured = process.env.RESEND_FROM?.trim();
    if (configured) return configured;
    return "Zyene Reviews <notifications@zyenereviews.com>";
}

export async function sendEmail({ to, subject, html, text, replyTo, headers }: SendEmailProps) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        console.error("Resend API Key missing");
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
            from: getResendFrom(),
            to,
            subject,
            html,
            ...(text ? { text } : {}),
            ...replyToPayload,
            ...headersPayload,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { sent: false, error: error.message };
        }

        if (data?.id) {
            console.info("[resend] Email accepted", { id: data.id, to });
        }
        return { sent: true, id: data?.id };
    } catch (error: unknown) {
        console.error("Send Email Exception:", error);
        return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
