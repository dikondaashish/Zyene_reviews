import { sendSMS } from "@/services/twilio/send-sms";
import { sendReviewRequestEmail } from "@/services/resend/send-review-request-email";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import type { BumpAfterSendLegs } from "./bump-after-send";

export type DashboardChannelSendResult = {
    sendStatus: "sent" | "failed";
    errorMessage: string | null;
    resendEmailId: string | null;
    bumpLegs?: BumpAfterSendLegs;
    smsLegStatus: "sent" | "failed" | null;
    emailLegStatus: "sent" | "failed" | null;
};

export async function dispatchDashboardReviewChannels(args: {
    channel: string;
    phoneNorm: string | null;
    emailNorm: string | null;
    displayName: string;
    businessName: string;
    senderName: string | undefined;
    businessEmail: string | undefined;
    reviewLink: string;
    subject: string;
}): Promise<DashboardChannelSendResult> {
    const {
        channel,
        phoneNorm,
        emailNorm,
        displayName,
        businessName,
        senderName,
        businessEmail,
        reviewLink,
        subject,
    } = args;

    let sendStatus: "sent" | "failed" = "sent";
    let errorMessage: string | null = null;
    let resendEmailId: string | null = null;
    let bumpLegs: BumpAfterSendLegs | undefined;
    let smsLegStatus: "sent" | "failed" | null = null;
    let emailLegStatus: "sent" | "failed" | null = null;

    if (channel === "sms" && phoneNorm) {
        const messageBody = `Hi ${displayName}! Thanks for visiting ${businessName}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
        const r = await sendSMS(phoneNorm, messageBody);
        if (!r.sent) {
            sendStatus = "failed";
            errorMessage = r.error ?? "SMS failed";
            smsLegStatus = "failed";
        } else {
            smsLegStatus = "sent";
        }
    } else if (channel === "email" && emailNorm) {
        const html = reviewRequestEmail({
            customerName: displayName,
            businessName,
            reviewLink,
            senderName,
        });
        const r = await sendReviewRequestEmail({
            to: emailNorm,
            subject,
            html,
            text: reviewRequestEmailPlainText({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            }),
            replyTo: businessEmail,
            fallbackSenderName: senderName,
            fallbackBusinessName: businessName,
        });
        if (!r.sent) {
            sendStatus = "failed";
            errorMessage = r.error ?? "Email failed";
            emailLegStatus = "failed";
        } else {
            resendEmailId = r.id ?? null;
            emailLegStatus = "sent";
        }
    } else if (channel === "both" && phoneNorm && emailNorm) {
        const messageBody = `Hi ${displayName}! Thanks for visiting ${businessName}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
        const smsR = await sendSMS(phoneNorm, messageBody);

        const html = reviewRequestEmail({
            customerName: displayName,
            businessName,
            reviewLink,
            senderName,
        });
        const emailR = await sendReviewRequestEmail({
            to: emailNorm,
            subject,
            html,
            text: reviewRequestEmailPlainText({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            }),
            replyTo: businessEmail,
            fallbackSenderName: senderName,
            fallbackBusinessName: businessName,
        });

        const smsOk = smsR.sent;
        const emailOk = emailR.sent;
        smsLegStatus = smsOk ? "sent" : "failed";
        emailLegStatus = emailOk ? "sent" : "failed";

        if (!smsOk && !emailOk) {
            sendStatus = "failed";
            errorMessage = [
                `SMS: ${smsR.error ?? "failed"}`,
                `Email: ${emailR.error ?? "failed"}`,
            ].join(". ");
        } else {
            sendStatus = "sent";
            bumpLegs = { phone: smsOk, email: emailOk };
            if (!smsOk || !emailOk) {
                const parts: string[] = [];
                if (!smsOk) parts.push(`SMS did not send: ${smsR.error ?? "failed"}`);
                if (!emailOk) parts.push(`Email did not send: ${emailR.error ?? "failed"}`);
                errorMessage = parts.join(" ");
            }
            if (emailOk && emailR.id) resendEmailId = emailR.id;
        }
    }

    return {
        sendStatus,
        errorMessage,
        resendEmailId,
        bumpLegs,
        smsLegStatus,
        emailLegStatus,
    };
}
