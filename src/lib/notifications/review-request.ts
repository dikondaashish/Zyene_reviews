import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { smsLabel } from "@/lib/security/sms-label";
import { customerFirstName, fillSubjectFirstName } from "@/lib/email/customer-first-name";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import { signedReviewCaptureLink } from "@/lib/review-requests/review-capture-url";
import { dispatchReviewRequest, type DispatchResult } from "@/lib/review-requests/dispatch-review-request";
import { isValidEmail } from "@/lib/review-requests/send-outbound-types";

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
    /** Campaign step: 1 = first message, 2/3 = reminders (claims are per step). */
    step?: 1 | 2 | 3;
    /** Optional human-friendly sender (e.g. owner first name) for From + signoff. */
    senderName?: string | null;
    /** The business's Support Email (`businesses.email`). Customer replies go here; omitted when invalid. */
    businessEmail?: string | null;
}

export type SendReviewRequestResult = DispatchResult & { emailSent: boolean; smsSent: boolean; reviewLink: string | null };

/** SMS is plain text: drop any HTML a shared template might carry. */
function toSmsText(template: string): string {
    return template.replace(/<[^>]+>/g, "").replace(/[ \t]+\n/g, "\n").trim();
}

/** Same rule as the single-request paths: only a valid Support Email becomes the reply-to. */
export function replyToAddress(businessEmail: string | null | undefined): string | null {
    const value = (businessEmail ?? "").trim();
    return value && isValidEmail(value) ? value : null;
}

/** Render subject placeholders; headers must stay single-line. */
export function renderCampaignSubject(subject: string, customerName: string, businessName: string): string {
    return fillSubjectFirstName(subject, customerName)
        .replace(/\{customer_name\}/g, customerName)
        .replace(/\{business_name\}/g, businessName)
        .replace(/[\r\n]+/g, " ")
        .trim();
}

/** Campaign + reminder sends. Guarded and claimed per message via dispatchReviewRequest. */
export async function sendReviewRequest(admin: SupabaseClient, options: SendReviewRequestOptions): Promise<SendReviewRequestResult> {
    const { requestId, businessId, businessSlug, businessName, customerName, isFollowUp = false } = options;
    const step = options.step ?? (isFollowUp ? 2 : 1);
    try {
        const reviewLink = signedReviewCaptureLink(businessSlug, requestId, businessId);
        const sender = (options.senderName || "").trim() || undefined;
        const smsBody = toSmsText(options.smsTemplate || DEFAULT_SMS_TEMPLATE)
            .replace(/\{first_name\}/g, smsLabel(customerFirstName(customerName), "there"))
            .replace(/\{customer_name\}/g, smsLabel(customerName, "there"))
            .replace(/\{business_name\}/g, smsLabel(businessName, "us"))
            .replace(/\{review_link\}/g, reviewLink);
        const templateProps = { customerName, businessName, reviewLink, template: options.emailTemplate, senderName: sender };
        const customSubject = options.emailSubject ? renderCampaignSubject(options.emailSubject, customerName, businessName) : "";

        const result = await dispatchReviewRequest(admin, {
            requestId, businessId, step,
            channels: options.contactMethods,
            phone: options.customerPhone ?? null,
            email: options.customerEmail ?? null,
            // A reminder is part of the same request, not a new ask.
            frequencyCap: step === 1 ? "apply" : "skip",
            sms: { body: smsBody },
            emailMessage: {
                subject: customSubject || reviewRequestSubject(businessName, isFollowUp, customerName),
                html: reviewRequestEmail(templateProps),
                text: reviewRequestEmailPlainText(templateProps),
                replyTo: replyToAddress(options.businessEmail),
            },
            senderName: sender,
            businessName,
        });
        return { ...result, reviewLink, smsSent: result.smsLegStatus === "sent", emailSent: result.emailLegStatus === "sent" };
    } catch (err: unknown) {
        logger.error({ err: err }, "Error in sendReviewRequest:");
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        return {
            sendStatus: "failed", deferUntil: null, errorMessage: message, resendEmailId: null,
            smsLegStatus: null, emailLegStatus: null, emailSent: false, smsSent: false, reviewLink: null,
        };
    }
}
