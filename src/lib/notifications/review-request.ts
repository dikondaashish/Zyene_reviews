import { logger } from "@/lib/logger";
import { sendSMS } from "@/services/twilio/send-sms";
import { sendEmail, buildFromLine } from "@/services/resend/send-email";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";

interface SendReviewRequestOptions {
    businessId: string;
    businessName: string;
    customerName: string;
    contactMethods: ("email" | "sms")[];
    customerEmail?: string | null;
    customerPhone?: string | null;
    template?: string;
    isFollowUp?: boolean;
    /** Optional human-friendly sender (e.g. owner first name) for From + signoff. */
    senderName?: string | null;
}

export async function sendReviewRequest({
    businessId,
    businessName,
    customerName,
    contactMethods,
    customerEmail,
    customerPhone,
    template,
    isFollowUp = false,
    senderName,
}: SendReviewRequestOptions) {
    const results = {
        emailSent: false,
        smsSent: false,
        error: null as string | null
    };

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";

    // In a real scenario, the review link would include a tracking ID
    // Since we don't have the request ID here (it depends on who calls us),
    // we assume the caller might want to provide it? 
    // Actually, the caller should probably handle the link generation or we do it.
    // Let's assume the template placeholders will be replaced by the caller or we do it with a generic link if needed.
    // For now, let's just use the business slug if we can get it, or a generic placeholder.

    // NOTE: The caller (Cron or Inngest) should ideally provide the full review link 
    // but for simplicity, we'll try to build a basic one if not provided in template.
    const reviewLink = `${protocol}://${rootDomain}/review/${businessId}`;

    try {
        // 1. Send SMS
        if (contactMethods.includes("sms") && customerPhone) {
            let messageBody = template || `Hi {customer_name}! Thanks for visiting {business_name}. We'd love your feedback: {review_link}`;

            // basic placeholder replacement if it's not a full HTML template
            if (!messageBody.includes("<")) {
                messageBody = messageBody
                    .replace(/\{customer_name\}/g, customerName)
                    .replace(/\{business_name\}/g, businessName)
                    .replace(/\{review_link\}/g, reviewLink);

                const smsResult = await sendSMS(customerPhone, messageBody);
                results.smsSent = smsResult.sent;
                if (!smsResult.sent) results.error = smsResult.error as string | null;
            }
        }

        // 2. Send Email
        if (contactMethods.includes("email") && customerEmail) {
            const sender = (senderName || "").trim() || undefined;
            const html = reviewRequestEmail({
                customerName,
                businessName,
                reviewLink,
                template,
                senderName: sender,
            });

            const subject = reviewRequestSubject(businessName, isFollowUp);

            const emailResult = await sendEmail({
                to: customerEmail,
                subject,
                html,
                text: reviewRequestEmailPlainText({
                    customerName,
                    businessName,
                    reviewLink,
                    template,
                    senderName: sender,
                }),
                from: buildFromLine({ senderName: sender, businessName }),
                headers: REVIEW_REQUEST_EMAIL_HEADERS,
            });

            results.emailSent = emailResult.sent;
        }

        return results;
    } catch (err: unknown) {
        logger.error({ err: err }, "Error in sendReviewRequest:");
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        return { ...results, error: message };
    }
}
