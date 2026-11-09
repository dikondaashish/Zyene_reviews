/**
 * Which platforms the recurring review-sync cron may enqueue.
 *
 * `review_platforms.sync_status` carries two unrelated meanings: connection state
 * (`active` - read by the integration cards and API-key auth) and run state
 * (`running` while a sync holds the lock, `idle` once `finalizeGoogleSync` completes).
 * Because `finalizeGoogleSync` sets `idle` on every SUCCESSFUL sync, a cron filtered
 * to `active` alone drops each platform the moment it syncs correctly, and retains
 * only the ones that failed before reaching finalize. Both states mean "connected",
 * so both belong here.
 *
 * Deliberately an allowlist rather than the `neq('running') + not like 'error%'`
 * denylist used by the Google performance cron: an unrecognised future status would
 * silently join a denylist and start spending Google API quota, but can never join
 * this list without a code change.
 *
 * Concurrency is NOT enforced here - `acquire_platform_lock` (atomic compare-and-set
 * on `running`) plus `enforceSyncCooldown` own that, and neither keys on the values
 * below. Widening this list cannot produce overlapping syncs.
 *
 * `error_api_call` is a transient failure (a Yelp/Facebook 5xx, a timeout, or a Yelp
 * key that is renewed later). Leaving it out meant one bad response stopped a
 * platform's automatic sync for good. Token errors (`error_token_*`,
 * `error_no_refresh_token`, `error_refresh_failed`) stay out: only a reconnect fixes them.
 */
export const RECURRING_SYNC_ELIGIBLE_STATUSES = ["active", "idle", "error_api_call"] as const;

export function isEligibleForRecurringSync(syncStatus: string | null | undefined): boolean {
    if (typeof syncStatus !== "string") return false;
    return (RECURRING_SYNC_ELIGIBLE_STATUSES as readonly string[]).includes(
        syncStatus.trim().toLowerCase()
    );
}
