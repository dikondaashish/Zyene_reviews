import { resend } from "./client";

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
    /** Plain-text body improves deliverability (multipart/alternative). */
    text?: string;
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

export async function sendEmail({ to, subject, html, text }: SendEmailProps) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        console.error("Resend API Key missing");
        return { sent: false, error: "RESEND_API_KEY is not set on the server" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: getResendFrom(),
            to,
            subject,
            html,
            ...(text ? { text } : {}),
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
