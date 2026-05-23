/** Google review sync — tokens */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { refreshGoogleToken } from "../business-profile";
import { TOKEN_EXPIRY_BUFFER_MS } from "../constants";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import type { AdminClient } from "./helpers";

export async function getValidGoogleToken(
    platformId: string
): Promise<{ accessToken: string | null; platform: GooglePlatformWithTokens }> {
    const admin = createAdminClient();
    
    // 1. Fetch RAW platform record (encrypted tokens)
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        logger.error({ err: platformError }, `[Token] Fetch failed for ${platformId}:`);
        const msg = platformError?.message ? `, error=${platformError.message}` : "";
        throw new Error(`Platform not found: id=${platformId}${msg}`);
    }

    // 2. Decrypt tokens via RPC (More robust than inline select)
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (platform.access_token) {
        const { data: decAccess, error: decAccessError } = await admin.rpc("decrypt_token", { 
            ciphertext: platform.access_token 
        });
        if (decAccessError) {
            logger.error({ err: decAccessError }, `[Token] Access token decryption failed for ${platformId}:`);
            throw new Error("Failed to decrypt access token");
        }
        accessToken = decAccess;
    }

    if (platform.refresh_token) {
        const { data: decRefresh, error: decRefreshError } = await admin.rpc("decrypt_token", { 
            ciphertext: platform.refresh_token 
        });
        if (decRefreshError) {
            logger.error({ err: decRefreshError }, `[Token] Refresh token decryption failed for ${platformId}:`);
            throw new Error("Failed to decrypt refresh token");
        }
        refreshToken = decRefresh;
    }

    const platformWithTokens: GooglePlatformWithTokens = {
        ...platform,
        access_token: accessToken,
        refresh_token: refreshToken,
    };

    // 3. Check Token Expiry (Buffer: 5 minutes)
    const now = new Date();
    const expiry = platformWithTokens.token_expires_at ? new Date(platformWithTokens.token_expires_at) : null;
    const isExpired = !expiry || (expiry.getTime() - now.getTime() < TOKEN_EXPIRY_BUFFER_MS);

    if (isExpired) {
        return refreshPlatformAccessToken(admin, platformId, refreshToken, platformWithTokens);
    }

    return { accessToken, platform: platformWithTokens };
}

/** Refresh OAuth access token and persist encrypted value (used on expiry or 401 from Google APIs). */
async function refreshPlatformAccessToken(
    admin: AdminClient,
    platformId: string,
    refreshToken: string | null,
    platformWithTokens: GooglePlatformWithTokens
): Promise<{ accessToken: string; platform: GooglePlatformWithTokens }> {
    if (!refreshToken) {
        logger.error(`[Token] CRITICAL: Refresh Token is missing for platform ${platformId}. Sync cannot proceed.`);
        await admin.from("review_platforms").update({ sync_status: "error_no_refresh_token" }).eq("id", platformId);
        throw new Error("No refresh token available - Please reconnect Google Account");
    }

    try {
        const tokens = await refreshGoogleToken(refreshToken);
        const accessToken = tokens.access_token;

        const { data: encAccess, error: encError } = await admin.rpc("encrypt_token", {
            plaintext: accessToken,
        });

        if (encError) {
            logger.error({ err: encError }, "[Token] Encryption failed during refresh:");
            throw new Error("Failed to secure new token");
        }

        const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);

        await admin
            .from("review_platforms")
            .update({
                access_token: encAccess,
                token_expires_at: newExpiry.toISOString(),
                sync_status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", platformId);

        return {
            accessToken,
            platform: {
                ...platformWithTokens,
                access_token: accessToken,
                token_expires_at: newExpiry.toISOString(),
            },
        };
    } catch (error: unknown) {
        logger.error({ err: error }, `[Token] Refresh failed:`);

        const errorMsg = error instanceof Error ? error.message : String(error);
        const isRevoked = errorMsg.includes("invalid_grant");

        await admin
            .from("review_platforms")
            .update({
                sync_status: isRevoked ? "error_token_revoked" : "error_refresh_failed",
                updated_at: new Date().toISOString(),
            })
            .eq("id", platformId);

        if (isRevoked) {
            throw new Error("Google connection expired. Please reconnect your account in Settings.");
        }
        throw new Error("Failed to refresh Google token. Please try again later.");
    }
}

/** Force refresh when Google returns 401 but `token_expires_at` still looks valid. */
export async function forceRefreshGoogleAccessToken(
    platformId: string
): Promise<{ accessToken: string; platform: GooglePlatformWithTokens }> {
    const admin = createAdminClient();
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        throw new Error(`Platform not found: id=${platformId}`);
    }

    let refreshToken: string | null = null;
    if (platform.refresh_token) {
        const { data: decRefresh, error: decRefreshError } = await admin.rpc("decrypt_token", {
            ciphertext: platform.refresh_token,
        });
        if (decRefreshError) {
            throw new Error("Failed to decrypt refresh token");
        }
        refreshToken = decRefresh;
    }

    return refreshPlatformAccessToken(admin, platformId, refreshToken, { ...platform });
}

