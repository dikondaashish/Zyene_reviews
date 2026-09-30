import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { primaryChannelFromMethods, type DripChannel } from "@/lib/campaigns/drip-phase1";
import { bumpCustomerAfterSend } from "@/lib/review-requests/bump-after-send";
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";
import { campaignJobSchema, loadAuthorizedCampaignJob, campaignContactPermission } from "@/services/campaigns/campaign-job-access";

export const processCampaignContact = inngest.createFunction(
    { id: "process-campaign-contact", name: "Process Campaign Contact", concurrency: { limit: 5 } },
    { event: "campaign/send.contact" },
    async ({ event, step }) => {
        const parsed = campaignJobSchema.safeParse(event.data);
        if (!parsed.success || !event.id) return { status: "skipped", reason: "Missing or invalid job authorization" };
        const job = parsed.data;
        // Inngest verifies the service signature; these metadata reads establish live user scope.
        const admin = createAdminClient();
        const campaign = await step.run("fetch-campaign-details", () => loadAuthorizedCampaignJob(admin, job));
        if (!campaign?.businesses) return { status: "skipped", reason: "Campaign access revoked" };
        const contactMethods: DripChannel[] = [];
        if (["email", "both"].includes(campaign.channel) && job.contact.email) contactMethods.push("email");
        if (["sms", "both"].includes(campaign.channel) && job.contact.phone) contactMethods.push("sms");
        if (!contactMethods.length) return { status: "skipped", reason: "Missing campaign contact info" };
        const claimId = `${job.campaignId}:${event.id}`;

        const canSend = await step.run("check-permissions", async () => {
            const liveCampaign = await loadAuthorizedCampaignJob(admin, job);
            if (!liveCampaign?.businesses) return { allowed: false, reason: "Campaign access revoked" };
            const permission = await campaignContactPermission(admin, job, liveCampaign.businesses.review_request_frequency_cap_days ?? 30);
            if (!permission.allowed) return permission;
            if (!(await reserveChannelUsage(liveCampaign.businesses.organization_id, contactMethods, claimId))) {
                return { allowed: false, reason: "Monthly channel allowance exhausted" };
            }
            return permission;
        });
        const requestRecord = await step.run("create-request-record", async () => {
            if (!(await loadAuthorizedCampaignJob(admin, job))) return null;
            const { data, error } = await admin.from("review_requests").insert({
                business_id: job.businessId, campaign_id: job.campaignId,
                customer_name: job.contact.name || null, customer_phone: job.contact.phone || null,
                customer_email: job.contact.email || null, channel: campaign.channel,
                status: canSend.allowed ? (campaign.delay_minutes > 0 ? "queued" : "sending") : "skipped",
                error_message: canSend.reason || null,
            }).select("id").single();
            if (error || !data) throw error ?? new Error("Failed to create campaign request");
            return data;
        });
        if (!requestRecord) return { status: "skipped", reason: "Campaign access revoked" };
        if (!canSend.allowed) return { status: "skipped", reason: canSend.reason };
        if (campaign.delay_minutes > 0) await step.sleep("initial-delay", `${campaign.delay_minutes}m`);

        const sendResult = await step.run("send-message", async () => {
            // Never reuse a cached authorization/entitlement after a delay.
            const liveCampaign = await loadAuthorizedCampaignJob(admin, job);
            if (!liveCampaign?.businesses) return { sendStatus: "skipped" as const, errorMessage: "Campaign access revoked" };
            const permission = await campaignContactPermission(admin, job, liveCampaign.businesses.review_request_frequency_cap_days ?? 30);
            if (!permission.allowed) return { sendStatus: "skipped" as const, errorMessage: permission.reason };
            if (liveCampaign.channel !== campaign.channel || !(await reserveChannelUsage(liveCampaign.businesses.organization_id, contactMethods, claimId))) {
                return { sendStatus: "skipped" as const, errorMessage: "Campaign channel or allowance changed" };
            }
            const result = await sendReviewRequest({
                businessId: job.businessId, businessName: liveCampaign.businesses.name,
                senderName: liveCampaign.businesses.sender_name, customerName: job.contact.name || "Customer",
                contactMethods, customerEmail: job.contact.email, customerPhone: job.contact.phone,
                template: liveCampaign.sms_template || liveCampaign.email_template || undefined,
            });
            return { sendStatus: result.emailSent || result.smsSent ? "sent" as const : "failed" as const, errorMessage: result.error };
        });
        await step.run("update-initial-database", async () => {
            // Settle this signed job's already-attempted delivery even if actor access was revoked meanwhile.
            const sent = sendResult.sendStatus === "sent";
            const { error } = await admin.from("review_requests").update({
                status: sendResult.sendStatus, error_message: sendResult.errorMessage,
                sent_at: sent ? new Date().toISOString() : null,
                ...(sent && campaign.follow_up_enabled ? {
                    drip_status: "active" as const, drip_steps_sent: 1,
                    last_drip_channel: primaryChannelFromMethods(contactMethods),
                } : {}),
            }).eq("id", requestRecord.id).eq("business_id", job.businessId).eq("campaign_id", job.campaignId);
            if (error) throw error;
            if (sent) await bumpCustomerAfterSend(admin, job.businessId, job.contact.name, job.contact.phone ?? null, job.contact.email ?? null, {
                phone: contactMethods.includes("sms"), email: contactMethods.includes("email"),
            });
        });
        return { status: sendResult.sendStatus === "sent" ? "completed" : "completed_with_error", sendResult };
    },
);
