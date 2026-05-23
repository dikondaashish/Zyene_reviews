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
import { getGoogleSearchKeywords } from "@/services/google/performance-queries";

const PUBSUB_GOOGLE_LOCK_RETRY_DELAY = "30s";
const PUBSUB_GOOGLE_LOCK_MAX_ATTEMPTS = 3;

function isGoogleLockConflictSkip(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const o = value as { skipped?: boolean; reason?: string };
    return o.skipped === true && o.reason === "sync_lock_conflict";
}

export const googleSeoAeoSyncWorker = inngest.createFunction(
  {
    id: "google-seo-aeo-sync-worker",
    name: "Google SEO/AEO Sync",
    concurrency: { limit: 1, key: "event.data.businessId" },
  },
  { event: "google-seo-aeo/sync.run" },
  async ({ event, step }) => {
    const { businessId } = event.data;
    
    const { query, keyword } = await step.run("determine-keyword", async () => {
      const admin = createAdminClient();
      const keywords = await getGoogleSearchKeywords(admin, businessId, 1);
      
      let term = "Best local business near me";
      if (keywords && keywords.length > 0) {
        term = keywords[0].keyword;
      } else {
        const { data: business } = await admin.from("businesses").select("city").eq("id", businessId).maybeSingle();
        if (business?.city) {
           term = `Best businesses in ${business.city}`;
        }
      }
      return { query: term, keyword: term };
    });

    await step.run("enqueue-ai-visibility", async () => {
      await inngest.send({
        name: "google-seo-aeo/ai-visibility.run",
        data: { businessId, query },
      });
    });

    await step.run("enqueue-heatmap", async () => {
      await inngest.send({
        name: "google-seo-aeo/heatmap.run",
        data: { businessId, keyword },
      });
    });

    return { success: true, businessId, query, keyword };
  }
);
