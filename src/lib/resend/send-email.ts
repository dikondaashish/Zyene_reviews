
import { resend } from "./client";

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    if (!process.env.RESEND_API_KEY) {
        console.error("Resend API Key missing");
        return { sent: false, error: "Resend API Key missing" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Zyene Ratings <notifications@zyeneratings.com>", // Update with verified domain or default
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { sent: false, error: error.message };
        }

        return { sent: true, id: data?.id };
    } catch (error: any) {
        console.error("Send Email Exception:", error);
        return { sent: false, error: error.message };
    }
}
