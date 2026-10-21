import type { SupabaseClient } from "@supabase/supabase-js";
import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { primaryChannelFromMethods, type DripChannel } from "@/lib/campaigns/drip-phase1";
import { bumpCustomerAfterSend } from "@/lib/review-requests/bump-after-send";
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";
import { quietHoursReason } from "@/lib/review-requests/defer-request";
import { campaignJobSchema, loadAuthorizedCampaignJob } from "@/services/campaigns/campaign-job-access";
import { campaignContactEligibility, campaignNotActiveReason } from "@/services/campaigns/campaign-contact-steps";

const MAX_QUIET_HOUR_DEFERRALS = 3;

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
        if (!campaign?.businesses) return { status: "skipped", reason: campaignNotActiveReason() };
        const contactMethods: DripChannel[] = [];
        if (["email", "both"].includes(campaign.channel) && job.contact.email) contactMethods.push("email");
        if (["sms", "both"].includes(campaign.channel) && job.contact.phone) contactMethods.push("sms");
        if (!contactMethods.length) return { status: "skipped", reason: "Missing campaign contact info" };
        const claimId = `${job.campaignId}:${event.id}`;

        const canSend = await step.run("check-permissions", async () => {
            const liveCampaign = await loadAuthorizedCampaignJob(admin, job);
            if (!liveCampaign?.businesses) return { allowed: false, channels: [] as DripChannel[], reason: campaignNotActiveReason() };
            const eligibility = await campaignContactEligibility(admin, job, contactMethods);
            if (!eligibility.allowed) return eligibility;
            if (!(await reserveChannelUsage(liveCampaign.businesses.organization_id, eligibility.channels, claimId))) {
                return { allowed: false, channels: [] as DripChannel[], reason: "Monthly channel allowance exhausted" };
            }
            return eligibility;
        });
        const requestRecord = await step.run("create-request-record", async () => {
            if (!(await loadAuthorizedCampaignJob(admin, job))) return null;
            const { data, error } = await admin.from("review_requests").insert({
                business_id: job.businessId, campaign_id: job.campaignId, trigger_source: "campaign",
                customer_name: job.contact.name || null, customer_phone: job.contact.phone || null,
                customer_email: job.contact.email || null, channel: campaign.channel,
                status: canSend.allowed ? (campaign.delay_minutes > 0 ? "queued" : "sending") : "skipped",
                error_message: canSend.reason || null,
            }).select("id").single();
            if (error || !data) throw error ?? new Error("Failed to create campaign request");
            if (job.importRowId) {
                // Link the import row to its request so the import report shows the real outcome.
                await (admin as unknown as SupabaseClient).from("enrollment_import_rows").update({ review_request_id: data.id })
                    .eq("id", job.importRowId).eq("business_id", job.businessId);
            }
            return data;
        });
        if (!requestRecord) return { status: "skipped", reason: campaignNotActiveReason() };
        if (!canSend.allowed) return { status: "skipped", reason: canSend.reason };
        if (campaign.delay_minutes > 0) await step.sleep("initial-delay", `${campaign.delay_minutes}m`);

        const sendOnce = async () => {
            // Never reuse a cached authorization/entitlement after a delay.
            const liveCampaign = await loadAuthorizedCampaignJob(admin, job);
            if (!liveCampaign?.businesses) return { sendStatus: "skipped" as const, errorMessage: campaignNotActiveReason() };
            if (liveCampaign.channel !== campaign.channel || !(await reserveChannelUsage(liveCampaign.businesses.organization_id, canSend.channels, claimId))) {
                return { sendStatus: "skipped" as const, errorMessage: "Campaign channel or allowance changed" };
            }
            if (!liveCampaign.businesses.slug) return { sendStatus: "failed" as const, errorMessage: "Business has no review page slug" };
            const result = await sendReviewRequest(admin, {
                requestId: requestRecord.id, businessId: job.businessId, businessSlug: liveCampaign.businesses.slug,
                businessName: liveCampaign.businesses.name, senderName: liveCampaign.businesses.sender_name,
                customerName: job.contact.name || "Customer", contactMethods: canSend.channels,
                customerEmail: job.contact.email, customerPhone: job.contact.phone,
                smsTemplate: liveCampaign.sms_template || undefined, emailTemplate: liveCampaign.email_template || undefined,
                emailSubject: liveCampaign.email_subject || undefined, step: 1,
            });
            return { sendStatus: result.sendStatus, errorMessage: result.errorMessage, reviewLink: result.reviewLink,
                deferUntil: result.deferUntil?.toISOString() ?? null, timezone: liveCampaign.businesses.timezone ?? null,
                smsLegStatus: result.smsLegStatus, emailLegStatus: result.emailLegStatus };
        };

        let sendResult = await step.run("send-message", sendOnce);
        for (let deferral = 1; deferral <= MAX_QUIET_HOUR_DEFERRALS; deferral++) {
            if (sendResult.sendStatus !== "deferred" || !("deferUntil" in sendResult) || !sendResult.deferUntil) break;
            const until = new Date(sendResult.deferUntil);
            await step.run(`record-quiet-hours-${deferral}`, async () => {
                await admin.from("review_requests").update({
                    status: "queued", scheduled_for: until.toISOString(), deferred_reason: quietHoursReason(until, "timezone" in sendResult ? sendResult.timezone : null),
                }).eq("id", requestRecord.id).eq("business_id", job.businessId).eq("campaign_id", job.campaignId);
            });
            await step.sleepUntil(`quiet-hours-${deferral}`, until);
            sendResult = await step.run(`send-message-after-quiet-hours-${deferral}`, sendOnce);
        }

        await step.run("update-initial-database", async () => {
            // Settle this signed job's already-attempted delivery even if actor access was revoked meanwhile.
            const status = sendResult.sendStatus === "deferred" ? "skipped" : sendResult.sendStatus;
            const sent = status === "sent";
            const legs = "smsLegStatus" in sendResult ? sendResult : null;
            const { error } = await admin.from("review_requests").update({
                status, error_message: sendResult.sendStatus === "deferred" ? "Quiet hours kept delaying this message" : sendResult.errorMessage,
                sent_at: sent ? new Date().toISOString() : null, deferred_reason: null,
                sms_status: legs?.smsLegStatus ?? null, email_status: legs?.emailLegStatus ?? null,
                ...("reviewLink" in sendResult && sendResult.reviewLink ? { review_link: sendResult.reviewLink } : {}),
                ...(sent && campaign.follow_up_enabled ? {
                    drip_status: "active" as const, drip_steps_sent: 1,
                    last_drip_channel: primaryChannelFromMethods(canSend.channels),
                } : {}),
            }).eq("id", requestRecord.id).eq("business_id", job.businessId).eq("campaign_id", job.campaignId);
            if (error) throw error;
            if (sent) await bumpCustomerAfterSend(admin, job.businessId, job.contact.name, job.contact.phone ?? null, job.contact.email ?? null, {
                phone: legs?.smsLegStatus === "sent", email: legs?.emailLegStatus === "sent",
            });
        });
        return { status: sendResult.sendStatus === "sent" ? "completed" : "completed_with_error", sendResult };
    },
);
