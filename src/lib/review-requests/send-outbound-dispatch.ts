import type { SupabaseClient } from "@supabase/supabase-js";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { plgSmsFooter } from "@/lib/growth/plg-attribution";
import { smsLabel } from "@/lib/security/sms-label";
import { channelsFor, dispatchReviewRequest, type DispatchResult } from "./dispatch-review-request";
import type { OutboundChannel } from "./send-outbound-types";

export type ChannelSendResult = DispatchResult;

/** API / Zapier / POS message copy, sent through the shared guarded dispatcher. */
export async function dispatchOutboundReviewChannels(admin: SupabaseClient, args: {
    requestId: string;
    businessId: string;
    channel: OutboundChannel;
    phoneNorm: string | null;
    emailNorm: string | null;
    displayName: string;
    businessName: string;
    senderName: string | undefined;
    businessEmail: string | undefined;
    reviewLink: string;
    subject: string;
}): Promise<ChannelSendResult> {
    const { displayName, businessName, senderName, reviewLink } = args;
    const templateProps = { customerName: displayName, businessName, reviewLink, senderName };
    return dispatchReviewRequest(admin, {
        requestId: args.requestId,
        businessId: args.businessId,
        step: 1,
        channels: channelsFor(args.channel),
        phone: args.phoneNorm,
        email: args.emailNorm,
        frequencyCap: "apply",
        sms: {
            body: `Hi ${smsLabel(displayName, "there")}! Thanks for visiting ${smsLabel(businessName, "us")}. We'd love your feedback - it only takes 30 seconds: ${reviewLink}${plgSmsFooter()}`,
        },
        emailMessage: {
            subject: args.subject,
            html: reviewRequestEmail(templateProps),
            text: reviewRequestEmailPlainText(templateProps),
            replyTo: args.businessEmail,
        },
        senderName,
        businessName,
    });
}
