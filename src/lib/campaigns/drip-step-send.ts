import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { pickDripChannel, shouldSkipDripSend } from "@/lib/campaigns/drip-phase1";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";
import { loadDripSendContext } from "@/lib/campaigns/drip-send-context";
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";
import { campaignContactPermission } from "@/services/campaigns/campaign-job-access";

export async function sendDripStep(args: {
    admin: ReturnType<typeof createAdminClient>;
    campaign: DripCampaignRow;
    req: DripRequestRow;
    step: 2 | 3;
    deliveryId: string;
}) {
    const { admin, campaign, req, step, deliveryId } = args;
    if (!deliveryId || shouldSkipDripSend(req)) return;
    const live = await loadDripSendContext(admin, campaign, req, step);
    if (!live) return;
    const { business, request } = live;

    const channel = pickDripChannel({
        alternate: live.campaign.drip_channel_alternate !== false,
        lastChannel:
            request.last_drip_channel === "sms" || request.last_drip_channel === "email"
                ? request.last_drip_channel
                : null,
        hasEmail: Boolean(request.customer_email),
        hasPhone: Boolean(request.customer_phone),
    });
    if (!channel) {
        logger.warn({ requestId: req.id, step }, "[drip] skip: no contact for channel");
        return;
    }

    try {
        const permission = await campaignContactPermission(admin, {
            businessId: business.id, contact: { name: request.customer_name ?? undefined,
                email: request.customer_email ?? undefined, phone: request.customer_phone ?? undefined },
        }, 0);
        if (!permission.allowed) return;
        // New cron occurrences consume allowance even if a prior delivery could not be recorded.
        if (!(await reserveChannelUsage(business.organization_id, [channel], `drip:${req.id}:step:${step}:job:${deliveryId}`))) return;
        const template = step === 3 ? live.campaign.drip_step3_template || live.campaign.follow_up_template : live.campaign.follow_up_template;
        const result = await sendReviewRequest({
            businessId: business.id,
            businessName: business.name,
            senderName: business.sender_name ?? null,
            customerName: request.customer_name || "Customer",
            contactMethods: [channel],
            customerEmail: request.customer_email,
            customerPhone: request.customer_phone,
            template: template || undefined,
            isFollowUp: true,
        });

        if (!result.emailSent && !result.smsSent) {
            logger.error(
                { requestId: req.id, step, error: result.error },
                "[drip] send failed",
            );
            return;
        }

        const now = new Date().toISOString();
        if (step === 2) {
            const { error } = await admin
                .from("review_requests")
                .update({
                    drip_steps_sent: 2,
                    step2_sent_at: now,
                    is_follow_up_sent: true,
                    follow_up_sent_at: now,
                    last_drip_channel: channel,
                })
                .eq("id", req.id)
                .eq("business_id", business.id).eq("campaign_id", campaign.id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 1);
            if (error) throw error;
        } else {
            const { error } = await admin
                .from("review_requests")
                .update({
                    drip_steps_sent: 3,
                    step3_sent_at: now,
                    last_drip_channel: channel,
                    drip_status: "completed",
                    drip_terminated_reason: "exhausted",
                })
                .eq("id", req.id)
                .eq("business_id", business.id).eq("campaign_id", campaign.id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 2);
            if (error) throw error;
        }
    } catch (e) {
        logger.error({ err: e, requestId: req.id, step }, "[drip] step failed");
    }
}
