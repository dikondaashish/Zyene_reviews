import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { isStaleReminder, pickDripChannel, reminderDelayHours, shouldSkipDripSend } from "@/lib/campaigns/drip-phase1";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";
import { loadDripSendContext } from "@/lib/campaigns/drip-send-context";
import { terminateReviewRequestDrip } from "@/lib/campaigns/terminate-drip";
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";

/** Opt-out style skips end the sequence; other skips (channel off, in progress) retry until stale. */
function terminalReason(message: string | null): "opted_out" | "unsubscribed" | null {
    if (!message) return null;
    if (/unsubscribed/i.test(message)) return "unsubscribed";
    if (/STOP|opted out/i.test(message)) return "opted_out";
    return null;
}

export async function sendDripStep(args: {
    admin: ReturnType<typeof createAdminClient>;
    campaign: DripCampaignRow;
    req: DripRequestRow;
    step: 2 | 3;
    deliveryId: string;
}) {
    const { admin, campaign, req, step, deliveryId } = args;
    if (!deliveryId || shouldSkipDripSend(req, { stopOnClick: campaign.stop_on_click !== false })) return;
    const live = await loadDripSendContext(admin, campaign, req, step);
    if (!live) return;
    const { business, request } = live;

    const delayHours = reminderDelayHours(live.campaign.follow_up_delay_hours);
    if (isStaleReminder(step === 2 ? request.sent_at : request.step2_sent_at, delayHours)) {
        // e.g. a campaign resumed long after its reminders were due: do not surprise customers.
        await terminateReviewRequestDrip(admin, req.id, "expired");
        return;
    }

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
    if (!business.slug) {
        logger.warn({ requestId: req.id, step }, "[drip] skip: business has no review page slug");
        return;
    }

    try {
        // One allowance reservation per reminder message; the message claim prevents double sends.
        if (!(await reserveChannelUsage(business.organization_id, [channel], `drip:${req.id}:step:${step}`))) return;
        const template = step === 3 ? live.campaign.drip_step3_template || live.campaign.follow_up_template : live.campaign.follow_up_template;
        // Same request id as step 1, so a click on any step stops the sequence.
        const result = await sendReviewRequest(admin, {
            requestId: req.id,
            businessId: business.id,
            businessSlug: business.slug,
            businessName: business.name,
            senderName: business.sender_name ?? null,
            businessEmail: business.email ?? null,
            customerName: request.customer_name || "Customer",
            contactMethods: [channel],
            customerEmail: request.customer_email,
            customerPhone: request.customer_phone,
            smsTemplate: template || undefined,
            emailTemplate: template || undefined,
            isFollowUp: true,
            step,
        });

        if (result.sendStatus === "deferred") return; // quiet hours: the next reminder run retries
        if (result.sendStatus !== "sent") {
            const reason = terminalReason(result.errorMessage);
            if (reason) await terminateReviewRequestDrip(admin, req.id, reason);
            logger.warn({ requestId: req.id, step, status: result.sendStatus, error: result.errorMessage }, "[drip] reminder not sent");
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
