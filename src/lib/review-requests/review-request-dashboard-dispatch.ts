import type { SupabaseClient } from "@supabase/supabase-js";
import { dashboardRequestSms } from "@/lib/review-requests/dashboard-request-message";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { channelsFor, dispatchReviewRequest, type DispatchResult } from "./dispatch-review-request";

export type DashboardChannelSendResult = DispatchResult;

/** Dashboard and scheduled-request copy, sent through the shared guarded dispatcher. */
export async function dispatchDashboardReviewChannels(admin: SupabaseClient, args: {
    requestId: string;
    businessId: string;
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
        sms: { body: dashboardRequestSms(displayName, businessName, reviewLink) },
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
