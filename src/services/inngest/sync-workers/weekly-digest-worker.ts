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

export const weeklyDigestWorker = inngest.createFunction(
  { id: "weekly-digest-worker", name: "Send Weekly Digest" },
  { event: "cron/weekly-digest.business" },
  async ({ event, step }) => {
    const { businessId } = event.data;
    const admin = createAdminClient();

    // Gathering is all reads, so it is safe to re-run on retry. Sending is not:
    // it used to sit in this same step behind a Promise.all, so one failed
    // recipient failed the step and the retry re-sent the digest to everyone who
    // had already received it. The send now happens in its own per-recipient
    // step below, which Inngest memoises individually.
    const digest = await step.run("build-digest", async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Fetch Business & Reviews
      const { data: business } = await admin
        .from("businesses")
        .select("id, name, organization_id")
        .eq("id", businessId)
        .single();

      if (!business) return null;

      const { data: reviews } = await admin
        .from("reviews")
        .select("rating, text, author_name, sentiment")
        .eq("business_id", businessId)
        .gte("created_at", weekAgo.toISOString());

      if (!reviews || reviews.length === 0) return null;

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

      if (!members || members.length === 0) return null;

      const userIds = members.map(m => m.user_id);
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select("*, users(email)")
        .eq("business_id", businessId)
        .in("user_id", userIds);

      const recipients = (prefs ?? [])
        .map(p => p as { user_id: string; digest_enabled?: boolean; users: { email?: string } | null })
        .filter(p => p.digest_enabled !== false && p.users?.email)
        .map(p => ({ userId: p.user_id, email: p.users?.email as string }))
        // Sorted so the per-recipient step ids below are stable across retries;
        // Postgres does not promise row order without an ORDER BY, and an
        // unstable id would defeat the memoisation this split exists for.
        .sort((a, b) => a.userId.localeCompare(b.userId));

      if (recipients.length === 0) return null;

      const emailHtml = weeklyDigestEmail({
        businessName: business.name,
        reviews: digestItems,
        totalNew,
        avgRating,
        pendingCount: pendingCount || 0,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`
      });

      return { businessName: business.name, recipients, emailHtml };
    });

    if (!digest) return;

    // Sequential rather than Promise.all: these are per-recipient steps, and a
    // burst of parallel sends is also the shape that trips Resend's rate limit.
    // Step ids key on user id, not email — they surface in the Inngest UI.
    for (const recipient of digest.recipients) {
      await step.run(`send-digest-${recipient.userId}`, () =>
        sendEmail({
          to: recipient.email,
          subject: `Weekly review summary for ${digest.businessName}`,
          html: digest.emailHtml
        })
      );
    }
  }
);

/**
 * Worker to process follow-ups for a single campaign.
 */
