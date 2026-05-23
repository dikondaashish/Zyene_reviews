import { logger } from "@/lib/logger";
import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { isGoogleSyncConflictError } from "@/services/google/sync-lock-utils";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { weeklyDigestEmail } from "@/services/resend/templates/weekly-digest-email";
import { sendEmail } from "@/services/resend/send-email";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";

const PUBSUB_GOOGLE_LOCK_RETRY_DELAY = "30s";
const PUBSUB_GOOGLE_LOCK_MAX_ATTEMPTS = 3;

function isGoogleLockConflictSkip(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const o = value as { skipped?: boolean; reason?: string };
    return o.skipped === true && o.reason === "sync_lock_conflict";
}

export const followUpWorker = inngest.createFunction(
  { id: "follow-up-worker", name: "Process Follow-ups" },
  { event: "cron/follow-up.campaign" },
  async ({ event, step }) => {
    const { campaignId } = event.data;
    const admin = createAdminClient();

    await step.run("process-follow-ups", async () => {
      // 1. Fetch Campaign
      const { data: campaign } = await admin
        .from("campaigns")
        .select("*, businesses (id, name, sender_name)")
        .eq("id", campaignId)
        .single();

      if (!campaign || !campaign.follow_up_enabled) return;

      const delayHours = campaign.follow_up_delay_hours || 72;
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - delayHours);

      // 2. Fetch Eligible Requests
      const { data: requests } = await admin
          .from("review_requests")
          .select("id, customer_name, customer_email, customer_phone")
          .eq("campaign_id", campaignId)
          .eq("status", "delivered")
          .eq("review_left", false)
          .is("completed_at", null)
          .eq("is_follow_up_sent", false)
          .lt("sent_at", cutoffTime.toISOString())
          .limit(100);

      if (!requests || requests.length === 0) return;

      // 3. Process
      for (const req of requests) {
        const methods = [];
        if ((campaign.channel === "email" || campaign.channel === "both") && req.customer_email) methods.push("email");
        if ((campaign.channel === "sms" || campaign.channel === "both") && req.customer_phone) methods.push("sms");

        try {
          const business = Array.isArray(campaign.businesses) ? campaign.businesses[0] : campaign.businesses;
          if (!business) continue;

          await sendReviewRequest({
            businessId: business.id,
            businessName: business.name,
            senderName: (business as { sender_name?: string | null }).sender_name ?? null,
            customerName: req.customer_name || "Customer",
            contactMethods: methods as ("email" | "sms")[],
            customerEmail: req.customer_email,
            customerPhone: req.customer_phone,
            template: campaign.follow_up_template || undefined,
            isFollowUp: true
          });

          await admin.from("review_requests").update({
            is_follow_up_sent: true,
            follow_up_sent_at: new Date().toISOString()
          }).eq("id", req.id);
        } catch (e) {
          logger.error({ err: e }, `[Worker] Follow-up failed for request ${req.id}:`);
        }
      }
    });
  }
);

/**
 * Background Google Performance sync (triggered by lightweight cron endpoint).
 */
