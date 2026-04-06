import { inngest } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";

/**
 * Worker to process a single automated follow-up reminder.
 */
export const followUpWorker = inngest.createFunction(
  { id: "follow-up-worker", name: "Process Automated Follow-up" },
  { event: "campaign/follow-up.dispatch" },
  async ({ event, step }) => {
    const { requestId, campaignId } = event.data;
    const admin = createAdminClient();

    return await step.run("send-follow-up", async () => {
      // 1. Re-verify eligibility (in case they left a review since dispatch)
      const { data: request, error: fetchError } = await admin
        .from("review_requests")
        .select("*, campaigns(*), businesses(*)")
        .eq("id", requestId)
        .eq("campaign_id", campaignId)
        .eq("review_left", false)
        .eq("is_follow_up_sent", false)
        .single();

      if (fetchError || !request) {
        console.log(`[Follow-up] Request ${requestId} no longer eligible or not found.`);
        return { skipped: true };
      }

      const campaign = request.campaigns as any;
      const business = request.businesses as any;

      if (!campaign || !business) return { skipped: true };

      // 2. Determine channels
      const contactMethods: ("email" | "sms")[] = [];
      if (campaign.channel === "email" || campaign.channel === "both") {
        if (request.customer_email) contactMethods.push("email");
      }
      if (campaign.channel === "sms" || campaign.channel === "both") {
        if (request.customer_phone) contactMethods.push("sms");
      }

      if (contactMethods.length === 0) return { skipped: true };

      // 3. Send
      await sendReviewRequest({
        businessId: business.id,
        businessName: business.name,
        customerName: request.customer_name || "Customer",
        contactMethods,
        customerEmail: request.customer_email,
        customerPhone: request.customer_phone,
        template: campaign.follow_up_template || undefined,
        isFollowUp: true
      });

      // 4. Mark Sent
      await admin
        .from("review_requests")
        .update({
          is_follow_up_sent: true,
          follow_up_sent_at: new Date().toISOString()
        })
        .eq("id", requestId);

      return { success: true };
    });
  }
);
