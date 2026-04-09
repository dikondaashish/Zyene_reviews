import { inngest } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { weeklyDigestEmail } from "@/services/resend/templates/weekly-digest-email";
import { sendEmail } from "@/services/resend/send-email";
import { sendReviewRequest } from "@/lib/notifications/review-request";

/**
 * Worker to sync a single review platform.
 * This runs in the background, fanned out from the Cron dispatcher.
 */
export const syncPlatformWorker = inngest.createFunction(
  { id: "sync-platform-worker", name: "Sync Review Platform" },
  { event: "review/sync.platform" },
  async ({ event, step }) => {
    const { platformId, platformType } = event.data;

    return await step.run(`sync-${platformType}`, async () => {
      console.log(`[Worker] Starting sync for ${platformType} platform: ${platformId}`);
      
      try {
        if (platformType === "google") {
          return await syncGoogleReviewsForPlatform(platformId);
        } else if (platformType === "yelp") {
          return await syncYelpReviewsForPlatform(platformId);
        } else if (platformType === "facebook") {
          return await syncFacebookReviewsForPlatform(platformId);
        } else {
          throw new Error(`Unknown platform type: ${platformType}`);
        }
      } catch (error) {
        console.error(`[Worker] Sync failed for ${platformType} (${platformId}):`, error);
        throw error; // Rethrow for Inngest retries
      }
    });
  }
);

/**
 * Worker to process weekly digest for a single business (cron fans out one event per business).
 */
export const weeklyDigestWorker = inngest.createFunction(
  { id: "weekly-digest-worker", name: "Send Weekly Digest" },
  { event: "cron/weekly-digest.business" },
  async ({ event, step }) => {
    const { businessId } = event.data;
    const admin = createAdminClient();

    await step.run("process-digest", async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Fetch Business & Reviews
      const { data: business } = await admin
        .from("businesses")
        .select("id, name, organization_id")
        .eq("id", businessId)
        .single();

      if (!business) return;

      const { data: reviews } = await admin
        .from("reviews")
        .select("rating, text, author_name, sentiment")
        .eq("business_id", businessId)
        .gte("created_at", weekAgo.toISOString());

      if (!reviews || reviews.length === 0) return;

      // 2. Status & Stats
      const { count: pendingCount } = await admin
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .is("response_text", null);

      const totalNew = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalNew;
      const digestItems = reviews.slice(0, 5).map((r) => ({
        rating: r.rating,
        authorName: r.author_name || "Anonymous",
        text: r.text || "",
        sentiment: r.sentiment as "positive" | "negative" | "neutral"
      }));

      // 3. Get Recipients
      const { data: members } = await admin
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", business.organization_id);

      if (!members || members.length === 0) return;

      const userIds = members.map(m => m.user_id);
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select("*, users(email)")
        .in("user_id", userIds);

      const recipients = prefs?.filter(p => {
        const pTyped = p as any;
        return (pTyped.digest_enabled !== false) && pTyped.users?.email;
      }) || [];

      if (recipients.length === 0) return;

      // 4. Send Emails
      const emailHtml = weeklyDigestEmail({
        businessName: business.name,
        reviews: digestItems,
        totalNew,
        avgRating,
        pendingCount: pendingCount || 0,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`
      });

      await Promise.all(recipients.map(r => {
        const rTyped = r as any;
        return sendEmail({
          to: rTyped.users.email,
          subject: `Weekly review summary for ${business.name}`,
          html: emailHtml
        });
      }));
    });
  }
);

/**
 * Worker to process follow-ups for a single campaign.
 */
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
        .select("*, businesses (id, name)")
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
          console.error(`[Worker] Follow-up failed for request ${req.id}:`, e);
        }
      }
    });
  }
);
