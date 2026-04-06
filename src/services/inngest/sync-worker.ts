import { inngest } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";

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
