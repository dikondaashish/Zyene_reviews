import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { bumpCustomerAfterSend } from "@/lib/review-requests/bump-after-send";
import { dispatchDashboardReviewChannels } from "@/lib/review-requests/review-request-dashboard-dispatch";
import type { SendRequestPrepared } from "./send-request-execute-prepare";

export async function executeImmediateSendReviewRequest(prepared: SendRequestPrepared) {
    const { supabase, admindClient, businessId, phoneNorm, emailNorm, channel, displayName, business, customerName } =
        prepared;

    const { data: requestRecord, error: insertError } = await supabase
        .from("review_requests")
        .insert({
            business_id: businessId,
            customer_name: displayName === "there" ? null : displayName,
            customer_phone: phoneNorm || null,
            customer_email: emailNorm,
            channel,
            status: "sending",
            trigger_source: "manual",
        })
        .select()
        .single();

    if (insertError) {
        logger.error({ err: insertError }, "Insert Request Error:");
        Sentry.captureException(insertError, { tags: { route: "requests-send", step: "insert_request" } });
        return apiError("Failed to create request record", { status: 500 });
    }

    const requestId = requestRecord.id;
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const slug = business.slug as string;
    const reviewCaptureDomain = rootDomain.includes("localhost")
        ? rootDomain
        : process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com";
    const reviewLink = `${protocol}://${reviewCaptureDomain}/${slug}?ref=${requestId}`;

    const businessName = (business.name as string) || "us";
    const bizRow = business as { email?: string | null; sender_name?: string | null };
    const senderName = (bizRow.sender_name || "").trim() || undefined;
    const businessEmail =
        typeof bizRow.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bizRow.email.trim())
            ? bizRow.email.trim()
            : undefined;
    const subject = `Quick question about your visit to ${businessName}`;

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
    const statusPatch = {
        status: sendStatus,
        error_message: errorMessage,
        sent_at: sentAt,
        review_link: reviewLink,
        sms_status: smsLegStatus,
        email_status: emailLegStatus,
        ...(resendEmailId ? { resend_email_id: resendEmailId } : {}),
    };

    const { data: updatedRows, error: updateError } = await supabase
        .from("review_requests")
        .update(statusPatch)
        .eq("id", requestId)
        .select();

    let finalRequestRecord = updatedRows?.[0] ?? null;

    if (updateError || !finalRequestRecord) {
        if (updateError) {
            logger.error({ err: updateError }, "Update Request Error:");
            Sentry.captureException(updateError, { tags: { route: "requests-send", step: "update_request" } });
        }
        const { data: adminRows, error: adminUpdateError } = await admindClient
            .from("review_requests")
            .update(statusPatch)
            .eq("id", requestId)
            .eq("business_id", businessId)
            .select();

        if (adminUpdateError || !adminRows?.[0]) {
            if (adminUpdateError) {
                logger.error({ err: adminUpdateError }, "[requests/send] admin fallback update failed:");
                Sentry.captureException(adminUpdateError, {
                    tags: { route: "requests-send", step: "update_request_admin" },
                });
            }
            finalRequestRecord = { ...requestRecord, ...statusPatch };
        } else {
            finalRequestRecord = adminRows[0];
        }
    }

    if (sendStatus === "sent") {
        await bumpCustomerAfterSend(supabase, businessId, customerName ?? undefined, phoneNorm, emailNorm, bumpLegs);
    }

    if (sendStatus === "failed") {
        const label = channel === "both" ? "SMS and email" : channel === "email" ? "email" : "SMS";
        return apiError(`Failed to send (${label}): ${errorMessage}`, { status: 500 });
    }

    return apiOk(finalRequestRecord);
}
