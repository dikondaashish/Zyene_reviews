import { sendSMS } from "@/lib/twilio/send-sms";
import { sendEmail } from "@/lib/resend/send-email";
import { reviewRequestEmail } from "@/lib/resend/templates/review-request-email";

interface SendReviewRequestOptions {
    businessId: string;
    businessName: string;
    customerName: string;
    contactMethods: ("email" | "sms")[];
    customerEmail?: string | null;
    customerPhone?: string | null;
    template?: string;
    isFollowUp?: boolean;
}

export async function sendReviewRequest({
    businessId,
    businessName,
    customerName,
    contactMethods,
    customerEmail,
    customerPhone,
    template,
    isFollowUp = false
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
            const html = reviewRequestEmail({
                customerName,
                businessName,
                reviewLink,
                template
            });

            const subject = isFollowUp
                ? `Friendly Reminder: Feedback for ${businessName}`
                : `How was your visit to ${businessName}?`;

            const emailResult = await sendEmail({
                to: customerEmail,
                subject,
                html
            });

            results.emailSent = !!emailResult.id;
        }

        return results;
    } catch (err: any) {
        console.error("Error in sendReviewRequest:", err);
        return { ...results, error: err.message };
    }
}
