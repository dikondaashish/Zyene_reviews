import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "./sync-service";
import { getLodging } from "./lodging";
import { computeLodgingHealth } from "./lodging-health";
import * as Sentry from "@sentry/nextjs";

export interface Phase4SyncResult {
    success: boolean;
    lodgingAvailable: boolean;
    healthScore?: number;
    error?: string;
}

export async function syncGoogleLodgingForPlatform(platformId: string): Promise<Phase4SyncResult> {
    const admin = createAdminClient();

    const { data: platform, error: pErr } = await admin
        .from("review_platforms")
        .select("id, platform, google_location_id")
        .eq("id", platformId)
        .single();

    if (pErr || !platform || platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, lodgingAvailable: false, error: "Invalid Google platform" };
    }

    const locId = platform.google_location_id as string;

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) {
            throw new Error("No access token");
        }

        const lodging = await getLodging(accessToken, locId);
        const score = computeLodgingHealth(lodging);
        const now = new Date().toISOString();

        await admin
            .from("review_platforms")
            .update({
                google_lodging_synced_at: now,
                google_lodging_health_score: score,
                google_lodging_available: true,
            })
            .eq("id", platformId);

        return { success: true, lodgingAvailable: true, healthScore: score };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const status = (e as Error & { statusCode?: number })?.statusCode;
        const notLodging =
            status === 404 ||
            /\b404\b|not found/i.test(msg) ||
            (/FAILED_PRECONDITION|can_operate_lodging_data|not supported for this location/i.test(msg) &&
                /\b400\b/.test(msg));

        if (notLodging) {
            const now = new Date().toISOString();
            try {
                await admin
                    .from("review_platforms")
                    .update({
                        google_lodging_synced_at: now,
                        google_lodging_health_score: 0,
                        google_lodging_available: false,
                    })
                    .eq("id", platformId);
            } catch (dbErr) {
                console.error("[Phase4] DB update failed:", dbErr);
            }
            return { success: true, lodgingAvailable: false };
        }

        console.error("[Phase4] Lodging sync failed:", msg);
        Sentry.captureException(e);
        return { success: false, lodgingAvailable: false, error: msg };
    }
}
