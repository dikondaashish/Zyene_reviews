import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";
import { bumpCustomerAfterSend } from "./bump-after-send";
import { dispatchOutboundReviewChannels } from "./send-outbound-dispatch";
import { prepareOutboundReviewRequest } from "./send-outbound-validate";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import {
    fail,
    isValidEmail,
    type SendOutboundReviewRequestInput,
    type SendOutboundReviewRequestResult,
} from "./send-outbound-types";
export type { OutboundChannel, OutboundTriggerSource, SendOutboundReviewRequestInput, SendOutboundReviewRequestResult } from "./send-outbound-types";

export async function sendOutboundReviewRequest(
    input: SendOutboundReviewRequestInput,
): Promise<SendOutboundReviewRequestResult> {
    const prepared = await prepareOutboundReviewRequest(input);
    if (!("b" in prepared)) {
        return prepared;
    }

    const { admin, channel, triggerSource, customerNameTrim, phoneNorm, emailNorm, b } = prepared;

    const requestId = randomUUID();
    const displayName = customerNameTrim || "there";

    const { error: insertError } = await admin.from("review_requests").insert({
        id: requestId,
        business_id: b.id,
        customer_name: customerNameTrim || null,
        customer_phone: phoneNorm,
        customer_email: emailNorm,
        channel,
        status: channel === "link" ? "sent" : "sending",
        trigger_source: triggerSource,
    });

    if (insertError) {
        logger.error({ err: insertError }, "[send-outbound] insert review_request:");
        return fail(500, channel, "Failed to create review request.");
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const captureDomain = rootDomain.includes("localhost")
        ? rootDomain
        : process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com";
    const reviewLink = `${protocol}://${captureDomain}/${b.slug}?ref=${requestId}`;

    if (channel === "link") {
        const sentAt = new Date().toISOString();
        await admin
            .from("review_requests")
            .update({
                review_link: reviewLink,
                sent_at: sentAt,
                status: "sent",
            })
            .eq("id", requestId);
        return {
            success: true,
            requestId,
            status: "sent",
            channel,
            reviewLink,
            errorMessage: null,
        };
    }

    const businessName = b.name || "us";
    const senderName = (b.sender_name || "").trim() || undefined;
    const businessEmail =
        typeof b.email === "string" && isValidEmail(b.email.trim()) ? b.email.trim() : undefined;
    const subject = reviewRequestSubject(businessName);

    const {
        sendStatus,
        errorMessage,
        resendEmailId,
        bumpLegs,
        smsLegStatus,
        emailLegStatus,
    } = await dispatchOutboundReviewChannels({
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
    const patch: Record<string, unknown> = {
        status: sendStatus,
        error_message: errorMessage,
        sent_at: sentAt,
        review_link: reviewLink,
        sms_status: smsLegStatus,
        email_status: emailLegStatus,
    };
    if (resendEmailId) patch.resend_email_id = resendEmailId;

    const { error: updateError } = await admin
        .from("review_requests")
        .update(patch)
        .eq("id", requestId)
        .eq("business_id", b.id);

    if (updateError) {
        logger.error({ err: updateError }, "[send-outbound] update review_request:");
    }

    if (sendStatus === "sent") {
        await bumpCustomerAfterSend(
            admin,
            b.id,
            customerNameTrim || undefined,
            phoneNorm,
            emailNorm,
            bumpLegs,
        );
    }

    if (sendStatus === "failed") {
        return fail(500, channel, errorMessage ?? "Send failed.", requestId, reviewLink);
    }

    return {
        success: true,
        requestId,
        status: "sent",
        channel,
        reviewLink,
        errorMessage,
    };
}
