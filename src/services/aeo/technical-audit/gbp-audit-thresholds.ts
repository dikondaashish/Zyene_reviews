/**
 * Pass/fail bars for the six Google Business Profile audit checks (F5.10).
 *
 * These are our editorial bar, not limits Google publishes. They are collected
 * here — rather than inlined next to each check — so the number a customer is
 * judged against is reviewable in one place, and so a test can assert the
 * boundary rather than restating a literal that has drifted.
 */

/** Owner-uploaded photos. Below this a profile reads as sparse in Maps. */
export const MIN_OWNER_PHOTOS = 10;

/** A profile whose newest owner photo predates this looks abandoned. */
export const PHOTO_RECENCY_DAYS = 90;

/** Lookback for post activity. Matches the photo window so both read alike. */
export const POST_WINDOW_DAYS = 90;

/** Three posts across the 90-day window — roughly monthly cadence. */
export const MIN_POSTS_IN_WINDOW = 3;

/**
 * Share of recent posts that must mention at least one tracked keyword. Half,
 * not all: posts legitimately cover events and offers that carry no search
 * term, and demanding 100% would push customers toward keyword stuffing.
 */
export const MIN_POST_KEYWORD_RATIO = 0.5;

/** Services listed on the profile. */
export const MIN_SERVICES = 5;

/** Share of listed services carrying a description. */
export const MIN_SERVICE_DESCRIPTION_RATIO = 0.5;
