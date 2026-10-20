import { logger } from "@/lib/logger";
import { sendSMS } from "@/services/twilio/send-sms";
import { smsLabel } from "@/lib/security/sms-label";
import { sendReviewRequestEmail } from "@/services/resend/send-review-request-email";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import { signedReviewCaptureLink } from "@/lib/review-requests/review-capture-url";

const DEFAULT_SMS_TEMPLATE = "Hi {customer_name}! Thanks for visiting {business_name}. We'd love your feedback: {review_link}";

interface SendReviewRequestOptions {
    /** `review_requests.id` this send belongs to; signed into the link for tracking. */
    requestId: string;
    businessId: string;
    businessSlug: string;
    businessName: string;
    customerName: string;
    contactMethods: ("email" | "sms")[];
    customerEmail?: string | null;
    customerPhone?: string | null;
    smsTemplate?: string;
    emailTemplate?: string;
    /** Custom subject; falls back to the default first/follow-up subject. */
    emailSubject?: string;
    isFollowUp?: boolean;
    /** Optional human-friendly sender (e.g. owner first name) for From + signoff. */
    senderName?: string | null;
}

/** SMS is plain text: drop any HTML a shared template might carry. */
function toSmsText(template: string): string {
    return template.replace(/<[^>]+>/g, "").replace(/[ \t]+\n/g, "\n").trim();
}

/** Render subject placeholders; headers must stay single-line. */
export function renderCampaignSubject(subject: string, customerName: string, businessName: string): string {
    return subject
        .replace(/\{customer_name\}/g, customerName)
        .replace(/\{business_name\}/g, businessName)
        .replace(/[\r\n]+/g, " ")
        .trim();
}

export async function sendReviewRequest({
    requestId,
    businessId,
    businessSlug,
    businessName,
    customerName,
    contactMethods,
    customerEmail,
    customerPhone,
    smsTemplate,
    emailTemplate,
    emailSubject,
    isFollowUp = false,
    senderName,
}: SendReviewRequestOptions) {
    const results = {
        emailSent: false,
        smsSent: false,
        error: null as string | null,
        reviewLink: null as string | null,
    };

    try {
        const reviewLink = signedReviewCaptureLink(businessSlug, requestId, businessId);
        results.reviewLink = reviewLink;

        // 1. Send SMS
        if (contactMethods.includes("sms") && customerPhone) {
            const messageBody = toSmsText(smsTemplate || DEFAULT_SMS_TEMPLATE)
                .replace(/\{customer_name\}/g, smsLabel(customerName, "there"))
                .replace(/\{business_name\}/g, smsLabel(businessName, "us"))
                .replace(/\{review_link\}/g, reviewLink);

            const smsResult = await sendSMS(customerPhone, messageBody);
            results.smsSent = smsResult.sent;
            if (!smsResult.sent) results.error = smsResult.error as string | null;
        }

        // 2. Send Email
        if (contactMethods.includes("email") && customerEmail) {
            const sender = (senderName || "").trim() || undefined;
            const templateProps = { customerName, businessName, reviewLink, template: emailTemplate, senderName: sender };
            const customSubject = emailSubject ? renderCampaignSubject(emailSubject, customerName, businessName) : "";

            const emailResult = await sendReviewRequestEmail({
                to: customerEmail,
                subject: customSubject || reviewRequestSubject(businessName, isFollowUp),
                html: reviewRequestEmail(templateProps),
                text: reviewRequestEmailPlainText(templateProps),
                fallbackSenderName: sender,
                fallbackBusinessName: businessName,
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
