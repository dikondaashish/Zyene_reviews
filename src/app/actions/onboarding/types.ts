import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import {
  bootstrapGoogleReviewsForPlatform,
  syncGoogleReviewsForPlatform,
} from "@/services/google/sync-service";
import { isGoogleSyncConflictError } from "@/services/google/sync-lock-utils";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { inngest } from "@/services/inngest/client";

/** Onboarding server-action shared types and Google post-connect sync helpers. */

export type OnboardingGoogleSyncResult =
  | { mode: "inngest" }
  | { mode: "inline" }
  | { mode: "failed"; error: string };

export interface GoogleStorefrontAddress {
  addressLines?: string[];
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
}

export interface GoogleBusinessLocation {
  name?: string;
  title?: string;
  businessName?: string;
  storefrontAddress?: GoogleStorefrontAddress;
  address?: string;
  phoneNumbers?: { primaryPhone?: string };
  phone?: string;
  categories?: { primaryCategory?: { displayName?: string } };
  category?: string;
  websiteUri?: string;
  metadata?: { newReviewUri?: string; mapsUri?: string; placeId?: string };
  profile?: unknown;
  city?: string;
  state?: string;
}

/**
 * Primary path: bootstrap first page inline, then Inngest for remaining pages + analysis.
 * Fallback when Inngest is unavailable (e.g. missing keys locally): inline sync + GBP side jobs.
 */
async function runGooglePostConnectSideJobs(platformId: string): Promise<void> {
  syncGooglePerformanceForPlatform(platformId).catch((e) =>
    logger.error({ err: e }, "[Onboarding] GBP performance sync:")
  );
  syncGooglePhase2ForPlatform(platformId).catch((e) => logger.error({ err: e }, "[Onboarding] GBP phase2:"));
  syncGoogleListingProfileForPlatform(platformId).catch((e) =>
    logger.error({ err: e }, "[Onboarding] GBP listing profile:")
  );
  syncGoogleLodgingForPlatform(platformId).catch((e) => logger.error({ err: e }, "[Onboarding] GBP lodging:"));
}

export async function enqueueGooglePostConnectSync(
  platformId: string
): Promise<OnboardingGoogleSyncResult> {
  let completedInline = false;
  try {
    const bootstrap = await bootstrapGoogleReviewsForPlatform(platformId).catch((err) => {
      if (isGoogleSyncConflictError(err)) return null;
      logger.error({ err: err }, "[Onboarding] bootstrapGoogleReviewsForPlatform:");
      return null;
    });
    completedInline = bootstrap?.completedInline === true;
    revalidatePath("/reviews");
    revalidatePath("/dashboard");
  } catch (bootstrapErr) {
    logger.error({ err: bootstrapErr }, "[Onboarding] bootstrapGoogleReviewsForPlatform failed:");
  }

  if (completedInline) {
    await runGooglePostConnectSideJobs(platformId);
    return { mode: "inline" };
  }

  try {
    await inngest.send({
      name: "google/sync.reviews",
      data: { platformId },
    });
    return { mode: "inngest" };
  } catch (inngestErr) {
    logger.error({ err: inngestErr }, "[Onboarding] inngest.send(google/sync.reviews) failed");
    try {
      await syncGoogleReviewsForPlatform(platformId);
      await runGooglePostConnectSideJobs(platformId);
      return { mode: "inline" };
    } catch (syncErr) {
      const msg = syncErr instanceof Error ? syncErr.message : String(syncErr);
      logger.error({ err: syncErr }, "[Onboarding] Fallback syncGoogleReviewsForPlatform failed:");
      return { mode: "failed", error: msg };
    }
  }
}
