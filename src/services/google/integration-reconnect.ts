import "server-only";

import { logger } from "@/lib/logger";
import { redis } from "@/lib/db/redis";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import {
    reattachOrphanedGoogleReviews,
    refreshGoogleReviewRollupsFromDb,
} from "@/services/google/sync-service";
import { normalizeGoogleLocationId } from "@/services/google/location-id";
import {
    listGoogleBusinessLocations,
    type GoogleTokenBundle,
} from "@/app/actions/onboarding/google-oauth-helpers";

export type GoogleReconnectResult =
    | { ok: true }
    | { ok: false; reason: "encrypt_failed" | "no_refresh_token" | "save_failed" | "account_mismatch" };

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

/**
 * Stores freshly exchanged Google tokens on a business the caller has ALREADY
 * been authorised to manage. Only credentials change: the chosen GBP location,
 * business details and slug are left alone (a reconnect is not onboarding).
 * A business without a Google row gets one with no location; the card then
 * prompts for location selection, as the old Supabase-Auth reconnect did.
 * When a location is already chosen, the consenting Google account must be able
 * to see it; otherwise nothing is saved (any Google account can consent here).
 */
export async function applyGoogleIntegrationTokens(
    userId: string,
    businessId: string,
    tokens: GoogleTokenBundle,
): Promise<GoogleReconnectResult> {
    const admin = createAdminClient();
    const { data: existing } = await admin
        .from("review_platforms")
        .select("id, google_location_id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    const storedLocationId = normalizeGoogleLocationId(existing?.google_location_id);
    if (storedLocationId && !(await tokenCanSeeLocation(tokens.accessToken, storedLocationId))) {
        logger.warn({ businessId }, "[Google reconnect] Consenting account cannot access the connected location");
        return { ok: false, reason: "account_mismatch" };
    }

    const encrypt = async (plaintext: string) => {
        const { data, error } = await admin.rpc("encrypt_token", { plaintext });
        if (error || !data) {
            logger.error({ err: error }, "[Google reconnect] encrypt_token failed");
            return null;
        }
        return data as string;
    };

    const encAccess = await encrypt(tokens.accessToken);
    const encRefresh = tokens.refreshToken ? await encrypt(tokens.refreshToken) : null;
    if (!encAccess || (tokens.refreshToken && !encRefresh)) return { ok: false, reason: "encrypt_failed" };

    const expiresIn = Number.isFinite(tokens.expiresIn) && tokens.expiresIn > 0
        ? tokens.expiresIn : DEFAULT_EXPIRES_IN_SECONDS;
    const now = new Date();
    const credentials = {
        access_token: encAccess,
        token_expires_at: new Date(now.getTime() + expiresIn * 1000).toISOString(),
        sync_status: "active" as const,
        updated_at: now.toISOString(),
        // Never overwrite a known grant with null - see verify-granted-scopes.ts.
        ...(tokens.grantedScopes ? { granted_scopes: tokens.grantedScopes } : {}),
        // Google only returns a refresh token on consent; keep the stored one otherwise.
        ...(encRefresh ? { refresh_token: encRefresh } : {}),
    };

    if (existing?.id) {
        const { error } = await admin.from("review_platforms").update(credentials).eq("id", existing.id);
        if (error) {
            logger.error({ err: error, businessId }, "[Google reconnect] review_platforms update failed");
            return { ok: false, reason: "save_failed" };
        }
    } else {
        if (!encRefresh) return { ok: false, reason: "no_refresh_token" };
        const { data: inserted, error } = await admin
            .from("review_platforms")
            .insert({
                ...credentials,
                business_id: businessId,
                platform: "google",
                total_reviews: 0,
                average_rating: 0,
                google_account_id: null,
                google_location_id: null,
                external_id: null,
                external_url: null,
            })
            .select("id")
            .single();
        if (error || !inserted?.id) {
            logger.error({ err: error, businessId }, "[Google reconnect] review_platforms insert failed");
            return { ok: false, reason: "save_failed" };
        }
        try {
            await reattachOrphanedGoogleReviews(admin, businessId, inserted.id);
            await refreshGoogleReviewRollupsFromDb(admin, businessId, inserted.id);
            await inngest.send({ name: "google-seo-aeo/sync.run", data: { businessId, trigger: "onboarding" } });
        } catch (err) {
            logger.error({ err, businessId }, "[Google reconnect] post-connect follow-up failed");
        }
    }

    try {
        await redis.del(`user_businesses:${userId}`);
    } catch (err) {
        logger.error({ err }, "[Google reconnect] Failed to clear business cache");
    }
    return { ok: true };
}

async function tokenCanSeeLocation(accessToken: string, locationId: string): Promise<boolean> {
    try {
        const locations = await listGoogleBusinessLocations(accessToken);
        return locations.some((loc) => normalizeGoogleLocationId(loc.name) === locationId);
    } catch (err) {
        logger.error({ err }, "[Google reconnect] Listing locations for the new token failed");
        return false;
    }
}
