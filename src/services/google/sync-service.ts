import { createAdminClient } from "@/lib/db/supabase/admin";
import { refreshGoogleToken, listAccounts, listLocations, listReviews, type GoogleReview } from "./business-profile";
import {
    AI_ANALYSIS_BATCH_SIZE,
    MAX_REVIEW_PAGES,
    PAGINATION_DELAY_MS,
    REQUEST_SMOOTHING_DELAY_MS,
    SYNC_COOLDOWN_MS,
    TOKEN_EXPIRY_BUFFER_MS,
} from "./constants";

import { inngest } from "@/services/inngest/client";

type SyncError = Error & { code?: "RATE_LIMIT" | "CONFLICT" };
type AdminClient = ReturnType<typeof createAdminClient>;
type ReviewPlatformRef = { id: string; business_id: string };

function createSyncError(message: string, code: "RATE_LIMIT" | "CONFLICT"): SyncError {
    const error = new Error(message) as SyncError;
    error.code = code;
    return error;
}

export async function acquireSyncLockOrThrow(admin: AdminClient, platformId: string) {
    const { data: lockAcquired, error: lockError } = await admin.rpc("acquire_platform_lock", {
        p_id: platformId,
    });

    if (lockError || !lockAcquired) {
        console.warn(`[Sync] Lock Rejected for platform ${platformId}`);
        if (lockError) console.warn(`[Sync] RPC Error:`, lockError);
        if (!lockAcquired) console.warn(`[Sync] Lock returned false (Already running or locked)`);
        throw createSyncError("Sync already in progress.", "CONFLICT");
    }
}

export function enforceSyncCooldown(platform: { last_synced_at?: string | null; sync_status?: string | null }) {
    if (!platform.last_synced_at) {
        return;
    }

    const lastSync = new Date(platform.last_synced_at);
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();

    if (platform.sync_status !== "running" && diff < SYNC_COOLDOWN_MS) {
        throw createSyncError("Please wait before syncing again.", "RATE_LIMIT");
    }
}

async function fetchGoogleReviewsPaginated(
    accessToken: string,
    googleAccountId: string,
    googleLocationId: string
): Promise<{
    googleReviews: GoogleReview[];
    apiTotalReviews?: number;
    apiAverageRating?: number;
}> {
    let pageToken: string | undefined = undefined;
    const googleReviews: GoogleReview[] = [];
    let apiTotalReviews: number | undefined = undefined;
    let apiAverageRating: number | undefined = undefined;
    let pageCount = 0;

    do {
        const apiResp = await listReviews(accessToken, googleAccountId, googleLocationId, pageToken);
        googleReviews.push(...apiResp.reviews);

        // Capture totals from first page payload only.
        if (pageCount === 0) {
            apiTotalReviews = apiResp.totalReviewCount;
            apiAverageRating = apiResp.averageRating;
        }

        pageToken = apiResp.nextPageToken;
        pageCount++;

        if (pageToken && pageCount < MAX_REVIEW_PAGES) {
            await new Promise((resolve) => setTimeout(resolve, PAGINATION_DELAY_MS));
        }
    } while (pageToken && pageCount < MAX_REVIEW_PAGES);

    return { googleReviews, apiTotalReviews, apiAverageRating };
}

export async function getValidGoogleToken(platformId: string) {
    const admin = createAdminClient();
    
    // 1. Fetch RAW platform record (encrypted tokens)
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        console.error(`[Token] Fetch failed for ${platformId}:`, platformError);
        throw new Error("Platform not found");
    }

    // 2. Decrypt tokens via RPC (More robust than inline select)
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (platform.access_token) {
        const { data: decAccess, error: decAccessError } = await admin.rpc("decrypt_token", { 
            ciphertext: platform.access_token 
        });
        if (decAccessError) {
            console.error(`[Token] Access token decryption failed for ${platformId}:`, decAccessError);
            throw new Error("Failed to decrypt access token");
        }
        accessToken = decAccess;
    }

    if (platform.refresh_token) {
        const { data: decRefresh, error: decRefreshError } = await admin.rpc("decrypt_token", { 
            ciphertext: platform.refresh_token 
        });
        if (decRefreshError) {
            console.error(`[Token] Refresh token decryption failed for ${platformId}:`, decRefreshError);
            throw new Error("Failed to decrypt refresh token");
        }
        refreshToken = decRefresh;
    }

    const platformWithTokens = { 
        ...platform, 
        access_token: accessToken, 
        refresh_token: refreshToken 
    };

    // 3. Check Token Expiry (Buffer: 5 minutes)
    const now = new Date();
    const expiry = platformWithTokens.token_expires_at ? new Date(platformWithTokens.token_expires_at) : null;
    const isExpired = !expiry || (expiry.getTime() - now.getTime() < TOKEN_EXPIRY_BUFFER_MS);

    if (isExpired) {
        console.log(`[Token] Expired for platform ${platformId}. Refreshing...`);

        if (!refreshToken) {
            console.error(`[Token] CRITICAL: Refresh Token is missing for platform ${platformId}. Sync cannot proceed.`);
            await admin.from("review_platforms").update({ sync_status: 'error_no_refresh_token' }).eq("id", platformId);
            throw new Error("No refresh token available - Please reconnect Google Account");
        }

        try {
            const tokens = await refreshGoogleToken(refreshToken);
            accessToken = tokens.access_token;
            
            // NEW: Encrypt the new access token before storing
            const { data: encAccess, error: encError } = await admin.rpc("encrypt_token", { 
                plaintext: accessToken 
            });
            
            if (encError) {
                console.error("[Token] Encryption failed during refresh:", encError);
                throw new Error("Failed to secure new token");
            }

            // Calculate new expiry (tokens.expires_in is in seconds)
            const newExpiry = new Date(now.getTime() + (tokens.expires_in * 1000));

            await admin.from("review_platforms").update({
                access_token: encAccess,
                token_expires_at: newExpiry.toISOString(),
                sync_status: 'active',
                updated_at: new Date().toISOString(),
            }).eq("id", platformId);

            console.log(`[Token] Refreshed. New expiry: ${newExpiry.toISOString()}`);

            return { 
                accessToken, 
                platform: { ...platformWithTokens, access_token: accessToken, token_expires_at: newExpiry.toISOString() } 
            };
        } catch (error: any) {
            console.error(`[Token] Refresh failed:`, error);
            
            const errorMsg = error?.message || "";
            const isRevoked = errorMsg.includes("invalid_grant");
            
            await admin.from("review_platforms").update({
                sync_status: isRevoked ? 'error_token_revoked' : 'error_refresh_failed',
                updated_at: new Date().toISOString()
            }).eq("id", platformId);

            if (isRevoked) {
                throw new Error("Google connection expired. Please reconnect your account in Settings.");
            }
            throw new Error("Failed to refresh Google token. Please try again later.");
        }
    }

    return { accessToken, platform: platformWithTokens };
}


/**
 * Phase 2: Refactored sync for Inngest Step Functions.
 * This decomposes the monolithic sync into smaller, step-capable primitives.
 */

export interface SyncResult {
    success: boolean;
    total: number;
    fetched?: number;
    analyzed: number;
    alerts: number;
}

export interface GoogleSyncContext {
    platform: any;
    accessToken: string;
    googleAccountId: string;
    googleLocationId: string;
}

/**
 * Step 1: Pre-sync check and acquire lock.
 */
export async function prepareGoogleSync(platformId: string): Promise<GoogleSyncContext> {
    const admin = createAdminClient();

    // 1. Fetch Platform
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) throw new Error("Platform not found");

    // 2. Cooldown
    enforceSyncCooldown(platform);

    // 3. Acquire Lock
    await acquireSyncLockOrThrow(admin, platformId);

    try {
        // 4. Token & IDs
        const { accessToken, platform: validPlatform } = await getValidGoogleToken(platformId);

        let googleAccountId = validPlatform.google_account_id;
        let googleLocationId = validPlatform.google_location_id;

        if (!googleAccountId || !googleLocationId) {
            console.log("[Sync] Refilled IDs missing. Fetching hierarchy...");
            const accounts = await listAccounts(accessToken!);
            if (accounts.length === 0) throw new Error("No Google Accounts found");
            const account = accounts[0];
            googleAccountId = account.name.split("/")[1];

            const locations = await listLocations(accessToken!, account.name);
            let locationDetails = null;
            if (validPlatform.external_id) {
                locationDetails = locations.find(l => l.name.endsWith(`/${validPlatform.external_id}`));
            }
            if (!locationDetails) {
                if (locations.length === 0) throw new Error("No Locations found");
                locationDetails = locations[0];
            }
            googleLocationId = locationDetails.name.split("/").pop() ?? null;

            await admin.from("review_platforms").update({
                google_account_id: googleAccountId,
                google_location_id: googleLocationId,
                external_id: googleLocationId
            }).eq("id", platformId);
        }

        return {
            platform: validPlatform,
            accessToken: accessToken!,
            googleAccountId: googleAccountId!,
            googleLocationId: googleLocationId!
        };
    } catch (err) {
        // Cleanup lock if setup fails
        await admin.from("review_platforms").update({ sync_status: 'idle', locked_until: null }).eq("id", platformId);
        throw err;
    }
}

/**
 * Step 2: Fetch and process a SINGLE page of reviews.
 */
export async function syncGoogleReviewsPage(
    context: GoogleSyncContext,
    pageToken?: string
): Promise<{ 
    nextPageToken?: string, 
    synced: number, 
    total: number, 
    avgRating: number 
}> {
    const admin = createAdminClient();

    const apiResp = await listReviews(
        context.accessToken, 
        context.googleAccountId, 
        context.googleLocationId, 
        pageToken
    );

    let syncedCount = 0;
    const reviewIdsToAnalyze: string[] = [];

    for (const review of apiResp.reviews) {
        const stats = await processGoogleReview(admin, context.platform, review);
        if (stats.upserted) {
            syncedCount++;
            if (stats.id && stats.needsAnalysis) {
                reviewIdsToAnalyze.push(stats.id);
            }
        }
    }

    // Trigger AI Analysis for this page's chunk
    if (reviewIdsToAnalyze.length > 0) {
        for (let i = 0; i < reviewIdsToAnalyze.length; i += AI_ANALYSIS_BATCH_SIZE) {
            const chunk = reviewIdsToAnalyze.slice(i, i + AI_ANALYSIS_BATCH_SIZE);
            await inngest.send({
                name: "review/analyze.batch",
                data: { reviewIds: chunk }
            });
        }
    }

    return {
        nextPageToken: apiResp.nextPageToken,
        synced: syncedCount,
        total: apiResp.totalReviewCount || 0,
        avgRating: apiResp.averageRating || 0
    };
}

/**
 * Step 3: Finalize sync (Update stats, clear lock).
 */
export async function finalizeGoogleSync(
    platformId: string, 
    businessId: string, 
    finalTotal?: number, 
    finalAvg?: number
) {
    const admin = createAdminClient();

    // 1. Fetch exact visible count for platform
    const { count } = await admin
        .from("reviews")
        .select("id", { count: 'exact', head: true })
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true);

    const updateData = {
        total_reviews: finalTotal ?? count ?? 0,
        average_rating: parseFloat((finalAvg ?? 0).toFixed(1)),
        sync_status: 'idle',
        last_synced_at: new Date().toISOString(),
        locked_until: null
    };

    await admin.from("review_platforms").update(updateData).eq("id", platformId);
    
    // Update business summary
    try {
        await admin.from("businesses").update({
            total_reviews: updateData.total_reviews,
            average_rating: updateData.average_rating
        }).eq("id", businessId);
    } catch (e) {
        console.error("[Sync] Finalize failed for business summary update:", e);
    }
}

/**
 * Compatibility wrapper for existing manual sync (Synchronous).
 * We keep this but internally it now uses the new decomposed steps.
 */
export async function syncGoogleReviewsForPlatform(platformId: string): Promise<SyncResult> {
    const context = await prepareGoogleSync(platformId);
    
    try {
        let pageToken: string | undefined = undefined;
        let totalSynced = 0;
        let lastResp = null;
        let pageCount = 0;

        do {
            lastResp = await syncGoogleReviewsPage(context, pageToken);
            pageToken = lastResp.nextPageToken;
            totalSynced += lastResp.synced;
            pageCount++;
            
            if (pageToken && pageCount < MAX_REVIEW_PAGES) {
                await new Promise(r => setTimeout(r, PAGINATION_DELAY_MS));
            }
        } while (pageToken && pageCount < MAX_REVIEW_PAGES);

        await finalizeGoogleSync(platformId, context.platform.business_id, lastResp?.total, lastResp?.avgRating);

        return {
            success: true,
            total: totalSynced,
            fetched: totalSynced, // For compatibility
            analyzed: 0,
            alerts: 0
        };
    } catch (error) {
        console.error("[Sync] Error in compatibility wrapper:", error);
        // Release lock on error
        const admin = createAdminClient();
        await admin.from("review_platforms").update({ sync_status: 'idle', locked_until: null }).eq("id", platformId);
        throw error;
    }
}

/**
 * Processes a single Google Review: Upserts to DB.
 */
export async function processGoogleReview(
    admin: AdminClient,
    platform: ReviewPlatformRef,
    review: GoogleReview
) {
    const ratingMap: Record<string, number> = { "FIVE": 5, "FOUR": 4, "THREE": 3, "TWO": 2, "ONE": 1 };
    const numericRating = ratingMap[review.starRating] || 0;

    const reviewData = {
        business_id: platform.business_id,
        platform: "google",
        platform_id: platform.id,
        external_id: review.reviewId,
        author_name: review.reviewer.displayName,
        author_avatar_url: review.reviewer.profilePhotoUrl || null,
        rating: numericRating,
        text: review.comment || "",
        review_date: review.createTime,
        response_status: review.reviewReply ? "responded" : "pending",
        response_text: review.reviewReply?.comment || null,
        responded_at: review.reviewReply?.updateTime || null,
        response_source: review.reviewReply ? 'google' : null,
        is_visible: true,
    };

    const { data: upserted, error: upsertError } = await admin
        .from("reviews")
        .upsert(reviewData, { onConflict: "business_id, platform, external_id" })
        .select("id, sentiment, text")
        .single();

    let upsertedOk = false;
    let needsAnalysis = false;

    if (upsertError) {
        console.error("Upsert Error:", upsertError);
    } else {
        upsertedOk = true;
        // Mark for analysis if text exists and not already analyzed
        if (upserted && !upserted.sentiment && upserted.text) {
            needsAnalysis = true;
        }
    }

    return { upserted: upsertedOk, id: upserted?.id, needsAnalysis, error: upsertError };
}
