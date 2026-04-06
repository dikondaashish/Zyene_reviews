import { inngest } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";
import { dailyDigestEmail } from "@/services/resend/templates/daily-digest-email";

/**
 * Worker to process a single business daily digest.
 */
export const digestWorker = inngest.createFunction(
  { id: "digest-worker", name: "Process Daily Business Digest" },
  { event: "business/digest.dispatch" },
  async ({ event, step }) => {
    const { businessId, organizationId, businessName } = event.data;
    const admin = createAdminClient();

    return await step.run("generate-and-send-digest", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 1. Fetch Recent Reviews
      const { data: reviews, error: reviewError } = await admin
        .from("reviews")
        .select("rating, text, author_name, sentiment, created_at")
        .eq("business_id", businessId)
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false });

      if (reviewError || !reviews || reviews.length === 0) {
        console.log(`[Digest] No new reviews for ${businessName} (${businessId}).`);
        return { skipped: true };
      }

      // 2. Fetch Pending/Total Stats
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

      // 3. Get Recipients (Org Members with Digest Enabled)
      const { data: members } = await admin
        .from("organization_members")
        .select(`
          user_id,
          notification_preferences!inner (
            phone_number,
            email_enabled,
            sms_enabled,
            digest_enabled,
            users (
              email
            )
          )
        `)
        .eq("organization_id", organizationId)
        .filter("notification_preferences.digest_enabled", "eq", true);

      if (!members || members.length === 0) {
        return { skipped: true, reason: "No eligible recipients" };
      }

      // 4. Build HTML
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zyenereviews.com";
      const emailHtml = dailyDigestEmail({
        businessName,
        reviews: digestItems,
        totalNew,
        avgRating,
        pendingCount: pendingCount || 0,
        dashboardUrl: `${appUrl}/dashboard`,
        settingsUrl: `${appUrl}/settings/notifications`
      });

      // 5. Send Emails
      const sentEmails = [];
      for (const m of members) {
        const pref = m.notification_preferences as any;
        const email = Array.isArray(pref) ? pref[0]?.users?.email : pref?.users?.email;
        
        if (email) {
          await sendEmail({
            to: email,
            subject: `Daily Review Summary for ${businessName} on Zyene Reviews`,
            html: emailHtml
          });
          sentEmails.push(email);
        }
      }

      return { success: true, count: sentEmails.length };
    });
  }
);
