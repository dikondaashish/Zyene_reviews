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

function enforceSyncCooldown(platform: { last_synced_at?: string | null; sync_status?: string | null }) {
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

async function acquireSyncLockOrThrow(admin: AdminClient, platformId: string) {
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

export interface SyncResult {
    success: boolean;
    total: number;
    fetched?: number;
    analyzed: number;
    alerts: number;
}

export async function syncGoogleReviewsForPlatform(platformId: string): Promise<SyncResult> {
    const admin = createAdminClient();

    // 0. FETCH PLATFORM & CHECK LOCK/COOLDOWN
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) throw new Error("Platform not found");

    // DEBUG LOG BEFORE LOCK ATTEMPT
    console.log(`[Sync] Debug Platform ${platformId}: status=${platform.sync_status}, updated_at=${platform.updated_at}, last_synced_at=${platform.last_synced_at}`);

    // Check cooldown first to avoid unnecessary lock contention.
    enforceSyncCooldown(platform);

    // ATOMIC LOCK ACQUISITION
    // Condition: 
    // 1. sync_status != 'running' (Idle/Error/Active)
    // 2. OR updated_at IS NULL (First run after migration)
    // 3. OR sync_status = 'running' but stale (> 10 mins)

    // ATOMIC LOCK ACQUISITION (VIA RPC)
    // We use a Postgres Function to guarantee atomic logic execution without client-side query building issues.
    console.log(`[Sync] Attempting Lock RPC for ${platformId}`);

    await acquireSyncLockOrThrow(admin, platformId);

    console.log(`[Sync] Lock Acquired for platform ${platformId}`);

    try {
        // 1. Get Valid Token (this refreshes if needed)
        const { accessToken, platform: validPlatform } = await getValidGoogleToken(platformId);

        // 2. Resolve IDs (Backfill if missing)
        let googleAccountId = validPlatform.google_account_id;
        let googleLocationId = validPlatform.google_location_id;

        // If missing, we MUST fetch them (Backward compatibility / First run before auth fix)
        if (!googleAccountId || !googleLocationId) {
            console.log("[Sync] IDs missing. Fetching hierarchy to backfill...");
            const accounts = await listAccounts(accessToken!);
            if (accounts.length === 0) throw new Error("No Google Accounts found");
            const account = accounts[0];
            googleAccountId = account.name.split("/")[1];

            const locations = await listLocations(accessToken!, account.name);

            let locationDetails = null;
            // Match by external_id if possible
            if (validPlatform.external_id) {
                // external_id is usually raw ID, e.g. "12345"
                // location.name is "locations/12345"
                locationDetails = locations.find(l => l.name.endsWith(`/${validPlatform.external_id}`));
            }
            if (!locationDetails) {
                if (locations.length === 0) throw new Error("No Locations found for this account");
                locationDetails = locations[0];
            }
            googleLocationId = locationDetails.name.split("/").pop() ?? null; // locations/{id} -> id

            // Update DB with backfilled IDs
            await admin.from("review_platforms").update({
                google_account_id: googleAccountId,
                google_location_id: googleLocationId,
            }).eq("id", platformId);

            console.log(`[Sync] Backfilled IDs: Account=${googleAccountId}, Location=${googleLocationId}`);
        }

        // 3. Request Smoothing
        await new Promise(resolve => setTimeout(resolve, REQUEST_SMOOTHING_DELAY_MS));

        // 4. Call reviews.list with pagination loop
        console.log(`[Sync] Fetching reviews for Account: ${googleAccountId}, Location: ${googleLocationId}`);
        const { googleReviews, apiTotalReviews, apiAverageRating } = await fetchGoogleReviewsPaginated(
            accessToken!,
            googleAccountId!,
            googleLocationId!
        );

        console.log(`[Sync] Fetched ${googleReviews.length} reviews`);

        let syncedCount = 0;
        let lastUpsertError: unknown = null;
        const reviewIdsToAnalyze: string[] = [];

        for (const review of googleReviews) {
            const stats = await processGoogleReview(admin, platform, review);
            if (stats.upserted) {
                syncedCount++;
                if (stats.id && stats.needsAnalysis) {
                    reviewIdsToAnalyze.push(stats.id);
                }
            } else if (stats.error) {
                lastUpsertError = stats.error;
            }
        }

        // 5. Trigger Batch AI Analysis (Drip Feed)
        if (reviewIdsToAnalyze.length > 0) {
            console.log(`[Sync] Queueing ${reviewIdsToAnalyze.length} reviews for background analysis in batches of ${AI_ANALYSIS_BATCH_SIZE}`);
            
            // Chunk into configured AI analysis batch size.
            for (let i = 0; i < reviewIdsToAnalyze.length; i += AI_ANALYSIS_BATCH_SIZE) {
                const chunk = reviewIdsToAnalyze.slice(i, i + AI_ANALYSIS_BATCH_SIZE);
                await inngest.send({
                    name: "review/analyze.batch",
                    data: { reviewIds: chunk }
                });
            }
        }

        // If we fetched reviews but failed to write them, surface a clear error.
        if (googleReviews.length > 0 && syncedCount === 0) {
            const msg = (() => {
                if (!lastUpsertError) return "Unknown upsert failure";
                if (lastUpsertError instanceof Error) return lastUpsertError.message;
                try {
                    return JSON.stringify(lastUpsertError);
                } catch {
                    return String(lastUpsertError);
                }
            })();
            throw new Error(
                "Failed to write Google reviews to the database. " +
                    "Check that Vercel has SUPABASE_SERVICE_ROLE_KEY set (server env) and that RLS policies allow inserts. " +
                    `Last error: ${msg}`
            );
        }

        // 5. Update Platform Stats
        const { count, data: dbReviews } = await admin
            .from("reviews")
            .select("rating", { count: 'exact' })
            .eq("business_id", platform.business_id)
            .eq("platform", "google");

        // Prefer Google's exact native stats. Fallback to our DB count if omitted.
        const totalReviews = apiTotalReviews ?? count ?? 0;
        const avgRating = apiAverageRating ?? (dbReviews && dbReviews.length > 0
            ? dbReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / dbReviews.length
            : 0);

        await admin.from("review_platforms").update({
            total_reviews: totalReviews,
            average_rating: parseFloat(avgRating.toFixed(1)),
            // sync_status is updated in finally
            external_id: googleLocationId, // Ensure external_id matches
        }).eq("id", platformId);

        // Fetch current business to check if URL is already set
        const { data: currentBusiness } = await admin
            .from("businesses")
            .select("google_review_url")
            .eq("id", platform.business_id)
            .single();

        const updateData: {
            total_reviews: number;
            average_rating: number;
        } = {
            total_reviews: totalReviews,
            average_rating: parseFloat(avgRating.toFixed(1))
        };

        // Note: URL finding requires location details. We skipped listLocations in optimized flow!
        // So we can only update URL if we already have it or if we did backfill.
        // Or we assume URL doesn't need constant update.
        // User didn't ask to preserve URL logic, but it's good to keep.
        // However, without location object, we can't extract URL.
        // That's fine. URL is usually static.
        // If backfill happened, we could have extracted it.
        // I will omit URL update here for optimized flow to save API calls.

        try {
            await admin.from("businesses").update(updateData).eq("id", platform.business_id);
        } catch (busError) {
            console.error("[Sync] Failed to update business stats:", busError);
        }

        return {
            success: true,
            total: syncedCount,
            fetched: googleReviews.length,
            analyzed: 0,
            alerts: 0
        };

    } catch (error: any) {
        console.error(`[Sync] Implementation Error:`, error);
        // Error status will be handled by finally block (reset to idle)
        throw error;
    } finally {
        // UNLOCK ONLY
        // Do NOT touch updated_at (it tracks lock acquisition time)
        console.log(`[Sync] Releasing Lock for platform ${platformId}`);

        await admin.from("review_platforms").update({
            sync_status: 'idle',
            last_synced_at: new Date().toISOString() // We update last_synced_at on finish (success or fail)
        }).eq("id", platformId);
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
