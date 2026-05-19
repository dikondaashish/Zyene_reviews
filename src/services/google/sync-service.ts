import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";
import {
    refreshGoogleToken,
    listAccounts,
    listLocations,
    listReviews,
    isGoogleUnauthorizedError,
    type GoogleReview,
} from "./business-profile";
import {
    AI_ANALYSIS_BATCH_SIZE,
    MAX_REVIEW_PAGES,
    PAGINATION_DELAY_MS,
    REQUEST_SMOOTHING_DELAY_MS,
    STALE_LOCK_TIMEOUT_MINUTES,
    SYNC_COOLDOWN_MS,
    TOKEN_EXPIRY_BUFFER_MS,
} from "./constants";

import { inngest } from "@/services/inngest/client";
import {
    enqueueAutoReplyJob,
    reviewQualifiesForAutoReplyEnqueue,
    type AutoReplyBusinessSettings,
} from "@/services/reviews/auto-reply-eligibility";
import { registerNotificationsWithRetry } from "./notifications";
import { computeReviewHash } from "@/utils/review-hash";
import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import {
    clearGoogleSyncBootstrapHandoff,
    markGoogleSyncBootstrapHandoff,
    reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";

export { isGoogleSyncConflictError } from "./sync-lock-utils";
import {
    isZyeneOriginatedReplySource,
    REVIEW_RESPONSE_SOURCE_GOOGLE,
} from "@/lib/reviews/response-source";

type SyncError = Error & { code?: "RATE_LIMIT" | "CONFLICT" };
type AdminClient = ReturnType<typeof createAdminClient>;
type ReviewPlatformRef = { id: string; business_id: string };

function syncStateObject(syncState: unknown): Record<string, unknown> {
    if (syncState && typeof syncState === "object" && !Array.isArray(syncState)) return syncState as Record<string, unknown>;
    return {};
}

async function clearForceFullSyncFlag(platformId: string): Promise<void> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();
    const obj = syncStateObject(data?.sync_state);
    if (!("force_full_sync" in obj)) return;
    const { force_full_sync: _ignored, ...rest } = obj as Record<string, unknown>;
    await admin.from("review_platforms").update({ sync_state: rest as Json }).eq("id", platformId);
}

function createSyncError(message: string, code: "RATE_LIMIT" | "CONFLICT"): SyncError {
    const error = new Error(message) as SyncError;
    error.code = code;
    return error;
}

function reviewerAvatarFromGoogle(reviewer: GoogleReview["reviewer"]): string | null {
    const url = reviewer.profilePhotoUrl || reviewer.profilePhotoUri;
    return url && url.trim() ? url.trim() : null;
}

function cleanStringArray(values: Array<string | null | undefined>): string[] | null {
    const cleaned = values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0);
    return cleaned.length > 0 ? Array.from(new Set(cleaned)) : null;
}

function googleReviewPhotoUrls(review: GoogleReview): string[] | null {
    const fromObjects = (review.photos || []).flatMap((p) => [p.photoUri, p.photoUrl, p.url]);
    const fromArray = review.photoUrls || [];
    return cleanStringArray([...fromObjects, ...fromArray]);
}

function googleAttributeChips(review: GoogleReview): string[] | null {
    const raw = review as unknown as Record<string, unknown>;
    const reviewQuestions = Array.isArray(review.reviewQuestions)
        ? review.reviewQuestions.map((q) => q.displayName || q.question || q.answer || q.rating || "")
        : [];
    const detailsObj = raw.details && typeof raw.details === "object" ? (raw.details as Record<string, unknown>) : {};
    const detailEntries = Object.entries(detailsObj).flatMap(([k, v]) => {
        if (typeof v === "string" && v.trim()) return [`${k}: ${v.trim()}`];
        if (typeof v === "number" || typeof v === "boolean") return [`${k}: ${String(v)}`];
        return [];
    });
    return cleanStringArray([...reviewQuestions, ...detailEntries]);
}

function googlePlaceContext(review: GoogleReview): string[] | null {
    const raw = review as unknown as Record<string, unknown>;
    const maybeStrings = [
        review.tripType,
        review.mealType,
        review.priceRange,
        typeof raw.serviceType === "string" ? raw.serviceType : undefined,
        typeof raw.seatingType === "string" ? raw.seatingType : undefined,
    ];
    const stayDate =
        review.stayDate?.year && review.stayDate?.month
            ? `${review.stayDate.year}-${String(review.stayDate.month).padStart(2, "0")}`
            : undefined;
    return cleanStringArray([...maybeStrings, stayDate]);
}

/**
 * After a full Google review list fetch, soft-hide rows that GBP no longer returns (e.g. customer deleted the review).
 * Skips if {@link reconciliationSafe} is false (sync hit MAX_REVIEW_PAGES with more pages left — list incomplete).
 */
export async function hideGoogleReviewsRemovedFromSource(
    admin: AdminClient,
    params: {
        businessId: string;
        platformId: string;
        googleExternalIdsSeen: ReadonlySet<string>;
        reconciliationSafe: boolean;
    }
): Promise<{ hidden: number }> {
    if (!params.reconciliationSafe) {
        console.log("[Sync] Skip soft-hide for removed reviews: sync did not fetch all pages (or stopped early).");
        return { hidden: 0 };
    }

    const { data: rows, error } = await admin
        .from("reviews")
        .select("id, external_id")
        .eq("business_id", params.businessId)
        .eq("platform", "google")
        .eq("platform_id", params.platformId)
        .eq("is_visible", true);

    if (error) {
        console.error("[Sync] Reconciliation select failed:", error);
        return { hidden: 0 };
    }

    const toHide = (rows || []).filter(
        (r: { id: string; external_id: string | null }) =>
            r.external_id && !params.googleExternalIdsSeen.has(r.external_id)
    );
    if (toHide.length === 0) {
        return { hidden: 0 };
    }

    const BATCH = 200;
    let hidden = 0;
    for (let i = 0; i < toHide.length; i += BATCH) {
        const ids = toHide.slice(i, i + BATCH).map((r: { id: string }) => r.id);
        const { error: upErr } = await admin.from("reviews").update({ is_visible: false }).in("id", ids);
        if (upErr) {
            console.error("[Sync] Soft-hide batch failed:", upErr);
        } else {
            hidden += ids.length;
        }
    }
    if (hidden > 0) {
        console.log(`[Sync] Soft-hid ${hidden} Google review(s) no longer returned by GBP (row kept, is_visible=false).`);
    }
    return { hidden };
}

/**
 * After disconnect, `review_platforms` is deleted and reviews get `platform_id = NULL` (ON DELETE SET NULL).
 * When the user reconnects, point those rows at the new platform and show them again.
 */
export async function reattachOrphanedGoogleReviews(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<{ reattached: number }> {
    const { data: rows, error } = await admin
        .from("reviews")
        .update({ platform_id: platformId, is_visible: true })
        .eq("business_id", businessId)
        .eq("platform", "google")
        .is("platform_id", null)
        .select("id");

    if (error) {
        console.error("[Google] Reattach orphaned reviews failed:", error);
        return { reattached: 0 };
    }
    const n = rows?.length ?? 0;
    if (n > 0) {
        console.log(`[Google] Reattached ${n} Google review row(s) to platform ${platformId}`);
    }
    return { reattached: n };
}

/** Recompute `total_reviews` / `average_rating` for the Google platform row and business (matches finalize-style google-only rollups). */
export async function refreshGoogleReviewRollupsFromDb(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<void> {
    const { data: ratingRows, error } = await admin
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true);

    if (error) {
        console.error("[Google] Rollup select failed:", error);
        return;
    }

    const list = ratingRows || [];
    const total = list.length;
    const avg = total > 0 ? list.reduce((s, r) => s + Number(r.rating ?? 0), 0) / total : 0;
    const avgRounded = parseFloat(avg.toFixed(1));

    await admin
        .from("review_platforms")
        .update({
            total_reviews: total,
            average_rating: avgRounded,
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId);

    try {
        await admin
            .from("businesses")
            .update({
                total_reviews: total,
                average_rating: avgRounded,
                updated_at: new Date().toISOString(),
            })
            .eq("id", businessId);
    } catch (e) {
        console.error("[Google] Business rollup update failed:", e);
    }
}

/**
 * Publishes imported reviews to the dashboard while a multi-page sync is still running.
 * Updates rollups + `last_synced_at` without clearing `sync_status: running`.
 */
export async function publishGoogleReviewSyncProgress(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<void> {
    await refreshGoogleReviewRollupsFromDb(admin, businessId, platformId);
    await admin
        .from("review_platforms")
        .update({
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId)
        .eq("sync_status", "running");
}

/**
 * First-page import during onboarding / post-connect so reviews appear in seconds, not after
 * the full Inngest pagination + performance pipeline. Releases the lock for the background job.
 */
export async function bootstrapGoogleReviewsForPlatform(
    platformId: string
): Promise<{ synced: number; hasMore: boolean; completedInline: boolean }> {
    const admin = createAdminClient();
    let context: GoogleSyncContext | null = null;

    try {
        await reconcileStaleGoogleSyncRun(admin, platformId);

        context = await prepareGoogleSync(platformId);
        const result = await syncGoogleReviewsPage(context, undefined);
        await publishGoogleReviewSyncProgress(admin, context.platform.business_id, platformId);

        const hasMore = Boolean(result.nextPageToken && !result.earlyExit);

        if (!hasMore) {
            await finalizeGoogleSync(
                platformId,
                context.platform.business_id,
                result.total,
                result.avgRating
            );
            const highWater = context.highestReviewUpdateTime;
            if (typeof highWater === "string" && highWater.length > 0) {
                await admin
                    .from("review_platforms")
                    .update({ last_review_update_time: highWater })
                    .eq("id", platformId);
            }
            await clearGoogleSyncBootstrapHandoff(admin, platformId);
            void enqueueMissingGoogleReviewAnalysis(context.platform.business_id).catch((e) =>
                console.error("[Sync] Bootstrap inline analysis enqueue failed:", e)
            );
            console.log(
                `[Sync] Bootstrap complete inline: synced=${result.synced}, platform=${platformId}`
            );
            return { synced: result.synced, hasMore: false, completedInline: true };
        }

        await markGoogleSyncBootstrapHandoff(admin, platformId);

        console.log(
            `[Sync] Bootstrap page 1: synced=${result.synced}, hasMore=true, awaiting Inngest, platform=${platformId}`
        );
        return { synced: result.synced, hasMore: true, completedInline: false };
    } catch (err) {
        if (context) {
            await admin
                .from("review_platforms")
                .update({ sync_status: "idle", locked_until: null })
                .eq("id", platformId);
        }
        throw err;
    }
}

/** Read pagination cursor saved by bootstrap or a partial sync (for Inngest resume). */
export async function readGoogleReviewSyncResumeCursor(platformId: string): Promise<string | undefined> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();
    const cursor = syncStateObject(data?.sync_state).last_page_cursor;
    if (typeof cursor === "string" && cursor.length > 0 && cursor !== "__EARLY_EXIT__") {
        return cursor;
    }
    return undefined;
}

/** Push `locked_until` forward while a long sync is still running (avoids TTL expiry mid-pagination). */
async function extendSyncLockTtl(admin: AdminClient, platformId: string): Promise<void> {
    const until = new Date(Date.now() + STALE_LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString();
    await admin
        .from("review_platforms")
        .update({ locked_until: until, updated_at: new Date().toISOString() })
        .eq("id", platformId)
        .eq("sync_status", "running");
}

export async function acquireSyncLockOrThrow(admin: AdminClient, platformId: string) {
    // Must pass p_lock_duration so PostgREST targets acquire_platform_lock(uuid, interval) only.
    // Two DB overloads (uuid) vs (uuid, interval) cause PGRST203 if only p_id is sent.
    const { data: lockAcquired, error: lockError } = await admin.rpc("acquire_platform_lock", {
        p_id: platformId,
        p_lock_duration: `${STALE_LOCK_TIMEOUT_MINUTES} minutes`,
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
    /** True when more pages existed but we stopped at {@link MAX_REVIEW_PAGES} — list is incomplete for reconciliation. */
    truncated: boolean;
}> {
    let pageToken: string | undefined = undefined;
    const googleReviews: GoogleReview[] = [];
    let apiTotalReviews: number | undefined = undefined;
    let apiAverageRating: number | undefined = undefined;
    let pageCount = 0;
    let sortByUpdateTime = true;

    do {
        let apiResp;
        try {
            apiResp = await listReviews(
                accessToken,
                googleAccountId,
                googleLocationId,
                pageToken,
                sortByUpdateTime
            );
        } catch (error) {
            if (!sortByUpdateTime || !isOrderByUnsupportedError(error)) {
                throw error;
            }
            console.warn(
                `[Sync] Full-sync fallback: orderBy=updateTime desc unsupported for account ${googleAccountId}/location ${googleLocationId}.`
            );
            sortByUpdateTime = false;
            apiResp = await listReviews(
                accessToken,
                googleAccountId,
                googleLocationId,
                pageToken,
                false
            );
        }
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

    const truncated = Boolean(pageToken);
    return { googleReviews, apiTotalReviews, apiAverageRating, truncated };
}

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
        console.error(`[Token] Fetch failed for ${platformId}:`, platformError);
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
    console.log(`[Token] Refreshing access token for platform ${platformId}...`);

    if (!refreshToken) {
        console.error(`[Token] CRITICAL: Refresh Token is missing for platform ${platformId}. Sync cannot proceed.`);
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
            console.error("[Token] Encryption failed during refresh:", encError);
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

        console.log(`[Token] Refreshed. New expiry: ${newExpiry.toISOString()}`);

        return {
            accessToken,
            platform: {
                ...platformWithTokens,
                access_token: accessToken,
                token_expires_at: newExpiry.toISOString(),
            },
        };
    } catch (error: unknown) {
        console.error(`[Token] Refresh failed:`, error);

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
    lastReviewUpdateTime: string | null;
    syncStateManager: SyncStateManager;
    /** Mutable counter used for checkpointing. */
    reviewsProcessed: number;
    /** Highest review.updateTime seen during this sync run. */
    highestReviewUpdateTime: string | null;
    /** True when Google accepts orderBy=updateTime desc for this location. */
    orderByUpdateTimeEnabled: boolean;
    /**
     * After the first list call we compare visible DB rows to Google `totalReviewCount`.
     * Used once per sync so we do not repeat the count query every page.
     */
    reviewGapCheckDone?: boolean;
}

/**
 * Inngest persists step output as JSON; `syncStateManager` becomes a plain object and
 * `instanceof SyncStateManager` is unreliable across bundles. Use duck typing and fall back.
 */
function syncStateManagerFromContext(context: GoogleSyncContext): SyncStateManager {
    const m = context.syncStateManager as unknown;
    if (
        m != null &&
        typeof m === "object" &&
        typeof (m as { checkpointSync?: unknown }).checkpointSync === "function" &&
        typeof (m as { beginSync?: unknown }).beginSync === "function" &&
        typeof (m as { completeSync?: unknown }).completeSync === "function" &&
        typeof (m as { failSync?: unknown }).failSync === "function"
    ) {
        return m as SyncStateManager;
    }
    return new SyncStateManager();
}

function isOrderByUnsupportedError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return (
        /Failed to list reviews:\s*400/i.test(msg) ||
        /INVALID_ARGUMENT/i.test(msg) ||
        /orderBy/i.test(msg)
    );
}

async function listReviewsWithOrderByFallback(
    context: GoogleSyncContext,
    pageToken?: string
) {
    if (!context.orderByUpdateTimeEnabled) {
        return listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            false
        );
    }

    try {
        let resp = await listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            true
        );

        // Some locations return 200 + empty `reviews` with orderBy even when Google reports reviews
        // (Maps/GBP show N reviews). We only catch thrown errors below; handle this silent mismatch too.
        const noPageToken = !pageToken;
        const emptyList = !resp.reviews || resp.reviews.length === 0;
        const googleSaysHasReviews =
            (typeof resp.totalReviewCount === "number" && resp.totalReviewCount > 0) ||
            (typeof resp.averageRating === "number" && resp.averageRating > 0);
        if (noPageToken && emptyList && googleSaysHasReviews) {
            console.warn(
                `[Sync] First page: 0 reviews but totalReviewCount=${String(resp.totalReviewCount)} avg=${String(resp.averageRating)} with orderBy; retrying without orderBy (platform ${context.platform.id}).`
            );
            context.orderByUpdateTimeEnabled = false;
            context.lastReviewUpdateTime = null;
            resp = await listReviews(
                context.accessToken,
                context.googleAccountId,
                context.googleLocationId,
                pageToken,
                false
            );
        }

        return resp;
    } catch (error) {
        if (!isOrderByUnsupportedError(error)) {
            throw error;
        }
        console.warn(
            `[Sync] orderBy=updateTime desc unsupported for platform ${context.platform.id}. Falling back to unsorted review fetch.`
        );
        context.orderByUpdateTimeEnabled = false;
        // Disable early-stop optimization if source isn't sorted.
        context.lastReviewUpdateTime = null;
        return listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            false
        );
    }
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

    if (platformError || !platform) {
        const msg = platformError?.message ? `, error=${platformError.message}` : "";
        throw new Error(`Platform not found: id=${platformId}${msg}`);
    }

    await reconcileStaleGoogleSyncRun(admin, platformId, platform);

    const { data: platformAfterReconcile } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    const activePlatform = platformAfterReconcile ?? platform;

    // 2. Cooldown
    enforceSyncCooldown(activePlatform);

    // 3. Acquire Lock
    await acquireSyncLockOrThrow(admin, platformId);
    await clearGoogleSyncBootstrapHandoff(admin, platformId);

    try {
        // 4. Token & IDs
        let { accessToken, platform: validPlatform } = await getValidGoogleToken(platformId);

        let googleAccountId = validPlatform.google_account_id;
        let googleLocationId = validPlatform.google_location_id;

        if (!googleLocationId && validPlatform.external_id) {
            googleLocationId = String(validPlatform.external_id);
        }

        const resolveGoogleIdsFromApi = async (token: string) => {
            console.log("[Sync] GBP account/location IDs missing. Fetching hierarchy...");
            const accounts = await listAccounts(token);
            if (accounts.length === 0) throw new Error("No Google Accounts found");
            const account = accounts[0];
            const resolvedAccountId = account.name.split("/")[1];

            const locations = await listLocations(token, account.name);
            let locationDetails = null;
            if (validPlatform.external_id) {
                locationDetails = locations.find((l) =>
                    l.name.endsWith(`/${validPlatform.external_id}`)
                );
            }
            if (!locationDetails) {
                if (locations.length === 0) throw new Error("No Locations found");
                locationDetails = locations[0];
            }
            const resolvedLocationId = locationDetails.name.split("/").pop() ?? null;

            googleAccountId = resolvedAccountId;
            googleLocationId = resolvedLocationId;

            await admin
                .from("review_platforms")
                .update({
                    google_account_id: googleAccountId,
                    google_location_id: googleLocationId,
                    external_id: googleLocationId,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", platformId);
        };

        if (!googleAccountId || !googleLocationId) {
            try {
                await resolveGoogleIdsFromApi(accessToken!);
            } catch (err) {
                if (!isGoogleUnauthorizedError(err)) {
                    throw err;
                }
                console.warn("[Sync] listAccounts 401 — forcing token refresh and retrying...");
                const refreshed = await forceRefreshGoogleAccessToken(platformId);
                accessToken = refreshed.accessToken;
                validPlatform = refreshed.platform;
                await resolveGoogleIdsFromApi(accessToken);
            }
        }

        // 5. Auto-register for real-time notifications if topic is configured (non-fatal for sync).
        const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
        if (topicName && googleAccountId) {
            const accountName = `accounts/${googleAccountId}`;
            console.log(`[Sync] Registering notifications for ${accountName} to topic ${topicName}`);
            const regResult = await registerNotificationsWithRetry({
                accessToken: accessToken!,
                accountName,
                topic: topicName,
                platformId,
                googleAccountId,
                logPrefix: "[Sync]",
            });
            if (regResult.ok) {
                console.log(`[Sync] Notification registration successful.`);
            }
        }

        return {
            platform: validPlatform,
            accessToken: accessToken!,
            googleAccountId: googleAccountId!,
            googleLocationId: googleLocationId!,
            lastReviewUpdateTime: (validPlatform as any)?.last_review_update_time ?? null,
            syncStateManager: new SyncStateManager(),
            reviewsProcessed: 0,
            highestReviewUpdateTime: (validPlatform as any)?.last_review_update_time ?? null,
            orderByUpdateTimeEnabled: true,
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
    nextPageToken?: string;
    synced: number;
    total: number;
    avgRating: number;
    /** Google `reviewId` values on this page — used to reconcile deletions after a full sync. */
    externalIdsOnPage: string[];
    earlyExit: boolean;
}> {
    const admin = createAdminClient();

    const apiResp = await listReviewsWithOrderByFallback(context, pageToken);

    /**
     * Incremental sync walks newest-first and stops when `updateTime <= last_review_update_time`.
     * If a past sync never imported the full history (e.g. job stopped early) but the watermark was
     * advanced to the listing's newest review, we would otherwise exit on the first row and never
     * paginate — leaving hundreds of older Google reviews missing from the DB.
     */
    if (!context.reviewGapCheckDone && !pageToken) {
        context.reviewGapCheckDone = true;
        const apiTotal =
            typeof apiResp.totalReviewCount === "number" && apiResp.totalReviewCount > 0
                ? apiResp.totalReviewCount
                : 0;
        if (apiTotal > 0 && context.lastReviewUpdateTime) {
            const { count: dbCount, error: countErr } = await admin
                .from("reviews")
                .select("id", { count: "exact", head: true })
                .eq("business_id", context.platform.business_id)
                .eq("platform", "google")
                .eq("is_visible", true);
            if (countErr) {
                console.error("[Sync] Review gap check (DB count) failed:", countErr);
            } else {
                const n = dbCount ?? 0;
                /** Small slack for removals / Maps vs API headline drift — large gaps still trigger backfill. */
                const slack = 25;
                if (n + slack < apiTotal) {
                    console.warn(
                        `[Sync] Incomplete Google history: ${n} visible reviews in DB vs Google totalReviewCount=${apiTotal}. ` +
                            `Clearing incremental watermark for this run to backfill (platform ${context.platform.id}).`
                    );
                    context.lastReviewUpdateTime = null;
                    context.highestReviewUpdateTime = null;
                    const { error: clearHwErr } = await admin
                        .from("review_platforms")
                        .update({ last_review_update_time: null })
                        .eq("id", context.platform.id);
                    if (clearHwErr) {
                        console.error("[Sync] Failed to clear last_review_update_time for backfill:", clearHwErr);
                    }
                }
            }
        }
    }

    const { data: autoReplyRow } = await admin
        .from("businesses")
        .select("auto_reply_enabled, auto_reply_enabled_at, auto_reply_min_rating, auto_reply_tone")
        .eq("id", context.platform.business_id)
        .single();
    const autoReplySettings = (autoReplyRow || null) as AutoReplyBusinessSettings | null;

    let syncedCount = 0;
    const reviewIdsToAnalyze: string[] = [];
    /** Every ID Google returned on this page — needed for deletion reconciliation even when we hash-skip or early-exit mid-page. */
    const externalIdsOnPage: string[] = [];
    for (const review of apiResp.reviews) {
        if (review.reviewId) {
            externalIdsOnPage.push(review.reviewId);
        }
    }

    let earlyExit = false;

    let newReviewsCount = 0;
    for (const review of apiResp.reviews) {
        if (
            review.updateTime &&
            (!context.highestReviewUpdateTime ||
                new Date(review.updateTime).getTime() > new Date(context.highestReviewUpdateTime).getTime())
        ) {
            context.highestReviewUpdateTime = review.updateTime;
        }

        const contentHash = computeReviewHash(review);

        if (context.lastReviewUpdateTime && new Date(review.updateTime).getTime() <= new Date(context.lastReviewUpdateTime).getTime()) {
            earlyExit = true;
            break;
        }

        const { data: existing } = await admin
            .from("reviews")
            .select("content_hash, response_source, response_text")
            .eq("business_id", context.platform.business_id)
            .eq("platform", "google")
            .eq("external_id", review.reviewId)
            .maybeSingle();

        if (existing?.content_hash && existing.content_hash === contentHash) {
            console.log(`[Sync] hash_match: skip review ${review.reviewId}`);
            continue;
        }

        const stats = await processGoogleReview(admin, context.platform, review, autoReplySettings, {
            existing,
            contentHash,
            googleUpdateTime: review.updateTime,
        });
        if (stats.upserted) {
            syncedCount++;
            if (stats.id && stats.needsAnalysis) {
                reviewIdsToAnalyze.push(stats.id);
            }
            if (stats.isNew) {
                newReviewsCount++;
            }
        }
    }

    console.log(`[Sync] Page synced: ${syncedCount} total reviews processed, ${newReviewsCount} were BRAND NEW. Google reports ${apiResp.totalReviewCount} total.`);

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

    context.reviewsProcessed += syncedCount;
    await syncStateManagerFromContext(context).checkpointSync(
        context.platform.id,
        earlyExit ? "__EARLY_EXIT__" : apiResp.nextPageToken ?? "",
        context.reviewsProcessed
    );

    await publishGoogleReviewSyncProgress(admin, context.platform.business_id, context.platform.id);

    return {
        nextPageToken: earlyExit ? undefined : apiResp.nextPageToken,
        synced: syncedCount,
        total: apiResp.totalReviewCount || 0,
        avgRating: apiResp.averageRating || 0,
        externalIdsOnPage,
        earlyExit,
    };
}

/**
 * Step 3: Finalize sync (Update stats, clear lock).
 */
export async function finalizeGoogleSync(
    platformId: string, 
    businessId: string, 
    _finalTotal?: number, 
    _finalAvg?: number
) {
    const admin = createAdminClient();

    /** Roll up from DB only — Google API `totalReviewCount` can be 0 for wrong listing while rows exist here, and `0 ?? dbCount` would incorrectly keep 0. */
    const { data: ratingRows, error: rollupErr } = await admin
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true);

    if (rollupErr) {
        console.error("[Sync] Finalize rollup select failed:", rollupErr);
    }

    const list = ratingRows || [];
    const total = list.length;
    const avg = total > 0 ? list.reduce((s, r) => s + Number(r.rating ?? 0), 0) / total : 0;
    const avgRounded = parseFloat(avg.toFixed(1));

    const updateData = {
        total_reviews: total,
        average_rating: avgRounded,
        sync_status: 'idle',
        last_synced_at: new Date().toISOString(),
        locked_until: null
    };

    await admin.from("review_platforms").update(updateData).eq("id", platformId);
    
    // Update business summary
    try {
        await admin.from("businesses").update({
            total_reviews: total,
            average_rating: avgRounded
        }).eq("id", businessId);
    } catch (e) {
        console.error("[Sync] Finalize failed for business summary update:", e);
    }
}

/**
 * Backfill queue for existing reviews that still miss AI analysis.
 * This is useful when AI was temporarily misconfigured and older rows were never analyzed.
 */
export async function enqueueMissingGoogleReviewAnalysis(
    businessId: string,
    limit = 2000
): Promise<{ queued: number }> {
    const admin = createAdminClient();

    const { data, error } = await admin
        .from("reviews")
        .select("id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true)
        .is("sentiment", null)
        .not("text", "is", null)
        .neq("text", "")
        .limit(limit);

    if (error) {
        console.error("[Sync] Failed to fetch missing AI analysis rows:", error);
        return { queued: 0 };
    }

    const ids = (data || []).map((row: { id: string }) => row.id);
    if (ids.length === 0) {
        return { queued: 0 };
    }

    for (let i = 0; i < ids.length; i += AI_ANALYSIS_BATCH_SIZE) {
        const chunk = ids.slice(i, i + AI_ANALYSIS_BATCH_SIZE);
        await inngest.send({
            name: "review/analyze.batch",
            data: { reviewIds: chunk }
        });
    }

    console.log(`[Sync] Queued ${ids.length} existing reviews for AI backfill.`);
    return { queued: ids.length };
}

/**
 * Compatibility wrapper for existing manual sync (Synchronous).
 * We keep this but internally it now uses the new decomposed steps.
 */
export async function syncGoogleReviewsForPlatform(platformId: string): Promise<SyncResult> {
    const context = await prepareGoogleSync(platformId);
    const admin = createAdminClient();
    const incrementalEnabled = process.env.ENABLE_INCREMENTAL_REVIEW_SYNC === "true";
    const stateObj = syncStateObject((context.platform as any)?.sync_state);
    const forceFullSync = stateObj.force_full_sync === true;
    const usingIncremental = incrementalEnabled && !forceFullSync;
    console.log(
        `[Sync] Mode selected for platform ${platformId}: ${usingIncremental ? "incremental" : "full"} ` +
            `(flag=${incrementalEnabled}, force_full_sync=${forceFullSync})`
    );

    try {
        // Default to full-sync behavior unless explicitly enabled.
        if (!incrementalEnabled || forceFullSync) {
            const { googleReviews, apiTotalReviews, apiAverageRating, truncated } =
                await fetchGoogleReviewsPaginated(
                context.accessToken,
                context.googleAccountId,
                context.googleLocationId
            );

            const { data: autoReplyRow } = await admin
                .from("businesses")
                .select("auto_reply_enabled, auto_reply_enabled_at, auto_reply_min_rating, auto_reply_tone")
                .eq("id", context.platform.business_id)
                .single();
            const autoReplySettings = (autoReplyRow || null) as AutoReplyBusinessSettings | null;

            let totalSyncedFull = 0;
            const seenGoogleExternalIds = new Set<string>();

            for (const review of googleReviews) {
                const stats = await processGoogleReview(admin, context.platform, review, autoReplySettings);
                if (stats.upserted) totalSyncedFull++;
                if (review.reviewId) seenGoogleExternalIds.add(review.reviewId);
            }

            // Safe to reconcile only if we fetched every page Google had (not truncated) and counts match when API gives a total.
            const reconciliationSafe =
                !truncated &&
                (typeof apiTotalReviews === "number" && apiTotalReviews > 0
                    ? googleReviews.length >= apiTotalReviews
                    : true);
            await hideGoogleReviewsRemovedFromSource(admin, {
                businessId: context.platform.business_id,
                platformId: context.platform.id,
                googleExternalIdsSeen: seenGoogleExternalIds,
                reconciliationSafe,
            });

            await finalizeGoogleSync(
                platformId,
                context.platform.business_id,
                apiTotalReviews,
                apiAverageRating
            );
            await enqueueMissingGoogleReviewAnalysis(context.platform.business_id);

            if (forceFullSync) {
                await clearForceFullSyncFlag(platformId);
            }

            return {
                success: true,
                total: totalSyncedFull,
                fetched: totalSyncedFull,
                analyzed: 0,
                alerts: 0,
            };
        }

        let pageToken: string | undefined = undefined;
        let totalSynced = 0;
        let lastResp = null;
        let pageCount = 0;
        const seenGoogleExternalIds = new Set<string>();
        await syncStateManagerFromContext(context).beginSync(platformId);

        do {
            lastResp = await syncGoogleReviewsPage(context, pageToken);
            for (const id of lastResp.externalIdsOnPage) {
                seenGoogleExternalIds.add(id);
            }
            pageToken = lastResp.earlyExit ? undefined : lastResp.nextPageToken;
            totalSynced += lastResp.synced;
            pageCount++;

            if (pageCount % 5 === 0) {
                await extendSyncLockTtl(admin, platformId);
            }

            if (pageToken && pageCount < MAX_REVIEW_PAGES) {
                await new Promise((r) => setTimeout(r, PAGINATION_DELAY_MS));
            }
        } while (pageToken && pageCount < MAX_REVIEW_PAGES);

        const fullListFetched = !pageToken && !lastResp?.earlyExit;
        await hideGoogleReviewsRemovedFromSource(admin, {
            businessId: context.platform.business_id,
            platformId: context.platform.id,
            googleExternalIdsSeen: seenGoogleExternalIds,
            reconciliationSafe: fullListFetched,
        });

        const newHighWaterMark =
            context.highestReviewUpdateTime ??
            context.lastReviewUpdateTime ??
            new Date().toISOString();
        console.log(
            `[Sync] Incremental complete for platform ${platformId}: high-water mark -> ${newHighWaterMark}, processed=${context.reviewsProcessed}`
        );
        await syncStateManagerFromContext(context).completeSync(
            platformId,
            newHighWaterMark,
            context.reviewsProcessed
        );

        await finalizeGoogleSync(platformId, context.platform.business_id, lastResp?.total, lastResp?.avgRating);
        await enqueueMissingGoogleReviewAnalysis(context.platform.business_id);

        return {
            success: true,
            total: totalSynced,
            fetched: totalSynced, // For compatibility
            analyzed: 0,
            alerts: 0
        };
    } catch (error) {
        console.error("[Sync] Error in compatibility wrapper:", error);
        if (usingIncremental) {
            try {
                const message = error instanceof Error ? error.message : String(error);
                await syncStateManagerFromContext(context).failSync(platformId, message);
            } catch (stateErr) {
                console.error("[Sync] Failed to mark sync_state failure:", stateErr);
            }
        }
        // Release lock on error
        const admin = createAdminClient();
        await admin.from("review_platforms").update({ sync_status: 'idle', locked_until: null }).eq("id", platformId);
        throw error;
    }
}

function sameReviewReplyText(a: string | null | undefined, b: string | null | undefined): boolean {
    return (a ?? "").trim() === (b ?? "").trim();
}

/**
 * Processes a single Google Review: Upserts to DB.
 */
export async function processGoogleReview(
    admin: AdminClient,
    platform: ReviewPlatformRef,
    review: GoogleReview,
    autoReplySettings?: AutoReplyBusinessSettings | null,
    opts?: {
        existing?: { content_hash?: string | null; response_source?: string | null; response_text?: string | null } | null;
        contentHash?: string;
        googleUpdateTime?: string;
    }
) {
    const ratingMap: Record<string, number> = { "FIVE": 5, "FOUR": 4, "THREE": 3, "TWO": 2, "ONE": 1 };
    const numericRating = ratingMap[review.starRating] || 0;

    const { data: existing } =
        opts && "existing" in opts && opts.existing !== undefined
            ? { data: opts.existing }
            : await admin
                  .from("reviews")
                  .select("content_hash, response_source, response_text")
                  .eq("business_id", platform.business_id)
                  .eq("platform", "google")
                  .eq("external_id", review.reviewId)
                  .maybeSingle();

    const googleReplyText = review.reviewReply?.comment ?? "";
    let responseSource: string | null = null;
    if (review.reviewReply) {
        const preserveZyene =
            !!existing &&
            isZyeneOriginatedReplySource(existing.response_source) &&
            sameReviewReplyText(existing.response_text, googleReplyText);
        responseSource = preserveZyene ? existing.response_source! : REVIEW_RESPONSE_SOURCE_GOOGLE;
    }

    const resolvedContentHash = opts?.contentHash ?? computeReviewHash(review);
    const reviewData = {
        business_id: platform.business_id,
        platform: "google",
        platform_id: platform.id,
        external_id: review.reviewId,
        author_name: review.reviewer.displayName,
        author_avatar_url: reviewerAvatarFromGoogle(review.reviewer),
        rating: numericRating,
        text: review.comment || "",
        review_date: review.createTime,
        google_update_time: opts?.googleUpdateTime ?? review.updateTime,
        content_hash: resolvedContentHash,
        response_status: review.reviewReply ? "responded" : "pending",
        response_text: review.reviewReply?.comment || null,
        responded_at: review.reviewReply?.updateTime || null,
        response_source: responseSource,
        review_photo_urls: googleReviewPhotoUrls(review),
        google_attribute_chips: googleAttributeChips(review),
        google_place_context: googlePlaceContext(review),
        is_visible: true,
    };

    const { data: upserted, error: upsertError } = await admin
        .from("reviews")
        .upsert(reviewData, { onConflict: "business_id, platform, external_id" })
        .select("id, sentiment, text, created_at")
        .single();

    let upsertedOk = false;
    let needsAnalysis = false;
    let isNew = false;

    if (upsertError) {
        console.error("Upsert Error:", upsertError);
    } else {
        upsertedOk = true;
        // If created_at is very recent (within last 10 seconds of upsert), it's brand new
        const createdAt = upserted?.created_at ? new Date(upserted.created_at) : null;
        if (createdAt && (Date.now() - createdAt.getTime() < 10000)) {
            isNew = true;
        }

        // Mark for analysis if text exists and not already analyzed
        if (upserted && !upserted.sentiment && upserted.text) {
            needsAnalysis = true;
        }

        if (
            reviewQualifiesForAutoReplyEnqueue(review, numericRating, autoReplySettings, upserted?.id)
        ) {
            try {
                await enqueueAutoReplyJob(upserted!.id);
            } catch (e) {
                console.error("[AutoReply] Failed to enqueue job:", e);
            }
        }
    }

    return { upserted: upsertedOk, id: upserted?.id, needsAnalysis, isNew, error: upsertError };
}
