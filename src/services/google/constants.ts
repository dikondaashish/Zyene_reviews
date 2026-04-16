/**
 * Named constants for Google Business Profile sync operations.
 * Replaces magic numbers scattered across sync-service, performance-sync, etc.
 */

// --- Sync Service ---
/** Buffer before token expiry to trigger refresh (5 minutes) */
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/** Minimum time between syncs for the same platform (2 minutes) */
export const SYNC_COOLDOWN_MS = 2 * 60 * 1000;

/** Delay between individual Google API requests to avoid rate limits */
export const REQUEST_SMOOTHING_DELAY_MS = 700;

/** Maximum number of review pages to fetch (safety cap, ~2000 reviews) */
export const MAX_REVIEW_PAGES = 40;

/** Delay between pagination requests */
export const PAGINATION_DELAY_MS = 300;

/** Number of reviews to batch for AI analysis */
export const AI_ANALYSIS_BATCH_SIZE = 5;

/**
 * Lock TTL passed to `acquire_platform_lock`. Must exceed worst-case Google review sync
 * (many pages + API delays); otherwise `locked_until` expires mid-run and overlapping jobs
 * or retries see spurious "Sync already in progress" / stolen locks.
 */
export const STALE_LOCK_TIMEOUT_MINUTES = 45;

// --- Performance Sync ---
/** Default number of days for daily performance metrics */
export const PERFORMANCE_DAILY_DAYS = 30;

/** Default number of months for keyword metrics */
export const PERFORMANCE_KEYWORD_MONTHS = 3;

/** Batch size for upserting daily performance metrics */
export const PERFORMANCE_METRICS_BATCH_SIZE = 200;

// --- Phase 2: Q&A & Place Actions ---
/** Maximum number of URIs to HEAD-check for broken links per sync */
export const LINK_CHECK_MAX = 12;

/** Batch size for upserting Q&A data */
export const QA_UPSERT_BATCH_SIZE = 50;

/** Page size for Q&A questions API */
export const QA_QUESTIONS_PAGE_SIZE = 10;

/** Answers returned per question */
export const QA_ANSWERS_PER_QUESTION = 10;

/** Page size for place action links and metadata */
export const PLACE_ACTIONS_PAGE_SIZE = 50;

/** Timeout for HEAD-checking place action URIs (ms) */
export const LINK_CHECK_TIMEOUT_MS = 8000;

// --- Profile Health ---
/** Points per completed health check (5 checks x 20 = 100 max score) */
export const HEALTH_CHECK_WEIGHT = 20;

/** Minimum phone number length to pass health check */
export const MIN_PHONE_LENGTH = 7;

/** Minimum business description length to pass health check */
export const MIN_DESCRIPTION_LENGTH = 40;
