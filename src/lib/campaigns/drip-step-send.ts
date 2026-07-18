import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { pickDripChannel, shouldSkipDripSend } from "@/lib/campaigns/drip-phase1";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";

function businessFromCampaign(campaign: DripCampaignRow) {
    const b = campaign.businesses;
    return Array.isArray(b) ? b[0] : b;
}

export async function sendDripStep(args: {
    admin: ReturnType<typeof createAdminClient>;
    campaign: DripCampaignRow;
    req: DripRequestRow;
    step: 2 | 3;
    template: string | undefined;
}) {
    const { admin, campaign, req, step, template } = args;
    if (shouldSkipDripSend(req)) return;

    const business = businessFromCampaign(campaign);
    if (!business) return;

    const channel = pickDripChannel({
        alternate: campaign.drip_channel_alternate !== false,
        lastChannel:
            req.last_drip_channel === "sms" || req.last_drip_channel === "email"
                ? req.last_drip_channel
                : null,
        hasEmail: Boolean(req.customer_email),
        hasPhone: Boolean(req.customer_phone),
    });
    if (!channel) {
        logger.warn({ requestId: req.id, step }, "[drip] skip: no contact for channel");
        return;
    }

    const { data: fresh } = await admin
        .from("review_requests")
        .select("drip_status, review_left, clicked_at, completed_at")
        .eq("id", req.id)
        .maybeSingle();
    if (!fresh || shouldSkipDripSend(fresh as unknown as DripRequestRow)) return;

    try {
        const result = await sendReviewRequest({
            businessId: business.id,
            businessName: business.name,
            senderName: business.sender_name ?? null,
            customerName: req.customer_name || "Customer",
            contactMethods: [channel],
            customerEmail: req.customer_email,
            customerPhone: req.customer_phone,
            template,
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
            await admin
                .from("review_requests")
                .update({
                    drip_steps_sent: 2,
                    step2_sent_at: now,
                    is_follow_up_sent: true,
                    follow_up_sent_at: now,
                    last_drip_channel: channel,
                })
                .eq("id", req.id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 1);
        } else {
            await admin
                .from("review_requests")
                .update({
                    drip_steps_sent: 3,
                    step3_sent_at: now,
                    last_drip_channel: channel,
                    drip_status: "completed",
                    drip_terminated_reason: "exhausted",
                })
                .eq("id", req.id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 2);
        }
    } catch (e) {
        logger.error({ err: e, requestId: req.id, step }, "[drip] step failed");
    }
}
