import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "./sync-service";
import { getGoogleLocation } from "./listing-information";
import { computeProfileHealth } from "./profile-health";
import * as Sentry from "@sentry/nextjs";

export interface Phase3SyncResult {
    success: boolean;
    profileHealthScore?: number;
    error?: string;
}

/**
 * Fetches Google listing, computes profile health, stores on `review_platforms`.
 */
export async function syncGoogleListingProfileForPlatform(platformId: string): Promise<Phase3SyncResult> {
    const admin = createAdminClient();

    const { data: platform, error: pErr } = await admin
        .from("review_platforms")
        .select("id, platform, google_location_id")
        .eq("id", platformId)
        .single();

    if (pErr || !platform || platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, error: "Invalid Google platform" };
    }

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) {
            throw new Error("No access token");
        }

        const loc = await getGoogleLocation(accessToken, platform.google_location_id as string);
        const { score } = computeProfileHealth(loc);
        const now = new Date().toISOString();

        await admin
            .from("review_platforms")
            .update({
                google_profile_health_score: score,
                google_listing_synced_at: now,
            })
            .eq("id", platformId);

        return { success: true, profileHealthScore: score };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[Phase3] Listing / profile health sync failed:", msg);
        Sentry.captureException(e);
        return { success: false, error: msg };
    }
}
