import type { SupabaseClient } from "@supabase/supabase-js";
import { bumpCustomerAfterSend } from "./bump-after-send";
import { dispatchDashboardReviewChannels } from "./review-request-dashboard-dispatch";
import { patchRequest } from "./scheduled-queue-patch";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import type { PreparedScheduledSend } from "./scheduled-queue-types";

export async function sendPreparedScheduledRow(
    admin: SupabaseClient,
    prepared: PreparedScheduledSend,
): Promise<"sent" | "failed"> {
    const { b, channel, phoneNorm, emailNorm, displayName, reviewLink, businessId, requestId, customerName } = prepared;

    const businessName = b.name || "us";
    const senderName = (b.sender_name || "").trim() || undefined;
    const businessEmail =
        typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim()) ? b.email.trim() : undefined;
    const subject = reviewRequestSubject(businessName);

    const { sendStatus, errorMessage, resendEmailId, bumpLegs, smsLegStatus, emailLegStatus } =
        await dispatchDashboardReviewChannels({
            channel,
            phoneNorm,
            emailNorm,
            displayName,
            businessName,
            senderName,
            businessEmail,
            reviewLink,
            subject,
        });

    const sentAt = sendStatus === "sent" ? new Date().toISOString() : null;
    await patchRequest(admin, businessId, requestId, {
        status: sendStatus,
        error_message: errorMessage,
        sent_at: sentAt,
        review_link: reviewLink,
        sms_status: smsLegStatus,
        email_status: emailLegStatus,
        ...(resendEmailId ? { resend_email_id: resendEmailId } : {}),
    });

    if (sendStatus === "sent") {
        await bumpCustomerAfterSend(admin, businessId, customerName ?? undefined, phoneNorm, emailNorm, bumpLegs);
    }

    return sendStatus;
}
