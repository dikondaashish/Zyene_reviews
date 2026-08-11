/**
 * Gate for the Google SEO/AEO surfaces that are estimated rather than measured.
 *
 * The AI-visibility and heatmap features shipped as heuristics: neither ever
 * queried an answer engine or a SERP provider. AI visibility compared the
 * business `average_rating` against tracked competitor ratings; heatmap cells
 * were string-built from the business city. Both therefore move when a customer's
 * review rating moves, which reads as causation.
 *
 * Until Phase 1 replaces them with real provider calls, these surfaces are off by
 * default. Set `AEO_SHOW_ESTIMATED_SURFACES=true` to re-enable them, in which case
 * the UI must render `ESTIMATED_SURFACE_DISCLOSURE` alongside every number.
 *
 * Server-only: read in RSC loaders and Inngest workers, never shipped to the client.
 */

const ENV_KEY = "AEO_SHOW_ESTIMATED_SURFACES";

/** Whether estimated AI-visibility / heatmap surfaces may render or be written. */
export function areEstimatedAeoSurfacesEnabled(): boolean {
    return process.env[ENV_KEY]?.trim().toLowerCase() === "true";
}

/** Shown verbatim next to any estimated figure. States the method, not just "beta". */
export const ESTIMATED_SURFACE_DISCLOSURE =
    "Estimated, not measured. These figures are derived from your review rating " +
    "compared against tracked competitors — no AI engine or search provider was " +
    "queried. Treat them as a placeholder until live tracking ships.";

/** Marker persisted on rows so estimated data can never be mistaken for measured data. */
export const ESTIMATED_METHOD = {
    aiVisibility: "heuristic_rating_comparison",
    heatmap: "heuristic_city_label",
} as const;

/** Run status recorded when a worker is asked to run a disabled estimated surface. */
export const DISABLED_RUN_STATUS = "disabled";

/** Message stored on disabled runs and surfaced in the run history. */
export const DISABLED_RUN_MESSAGE =
    "Estimated AI-visibility and heatmap runs are disabled pending real provider integration.";

const LIVE_SAMPLING_ENV_KEY = "AEO_LIVE_SAMPLING";

/**
 * Whether the Phase 1 sampling orchestrator (E-7) may dispatch to real engines.
 *
 * Deliberately NOT the flag above. That one asks "may we display estimated
 * numbers"; this one asks "may we spend money calling engines". Reusing it
 * would mean live sampling only runs for deployments that opted into seeing
 * fabricated data — exactly backwards, and it would couple a display choice to
 * a billing decision.
 *
 * Same strict comparison, for the same reason: anything other than the literal
 * string "true" leaves it off, so a typo, a blank value, or "1" fails closed.
 * The failure that matters here is money leaving by accident.
 */
export function isLiveSamplingEnabled(): boolean {
    return process.env[LIVE_SAMPLING_ENV_KEY]?.trim().toLowerCase() === "true";
}

const METERED_BILLING_ENV_KEY = "AEO_METERED_BILLING_LIVE";

/**
 * Whether a settled test may debit an org's AEO credit balance or charge
 * Stripe overage (E-9).
 *
 * A THIRD gate alongside AEO_LIVE_SAMPLING and the Stripe price's own `active`
 * flag — this one specifically is checked as the FIRST line of the billing
 * step, before any database or Stripe call, so leaving it unset makes the
 * step a true no-op rather than a query against tables a not-yet-applied
 * migration hasn't created. Three independent things must all be true before
 * a customer's card is ever touched: this flag, the credit-ledger migration
 * applied, and the AEO Test Overage price active. None of them imply the
 * others.
 */
export function isMeteredBillingLive(): boolean {
    return process.env[METERED_BILLING_ENV_KEY]?.trim().toLowerCase() === "true";
}

const LIVE_CRAWLING_ENV_KEY = "AEO_LIVE_CRAWLING";

/**
 * Whether the E-3 scheduled crawler may fetch a real customer's site.
 *
 * Same fail-closed posture as isLiveSamplingEnabled(), for the equivalent
 * reason on this surface: an unset or malformed value must never result in
 * this app's crawler making real HTTP requests against a business's real
 * domain. Checked first in the worker, before any robots.txt fetch.
 */
export function isLiveCrawlingEnabled(): boolean {
    return process.env[LIVE_CRAWLING_ENV_KEY]?.trim().toLowerCase() === "true";
}

const LIVE_ALERTING_ENV_KEY = "AEO_LIVE_ALERTING";

/**
 * Whether F8 may create real aeo_alerts rows and send real digest emails.
 *
 * Same fail-closed posture as the other AEO live flags. An unset or
 * malformed value must never result in a customer receiving an email about
 * their AEO data — checked first in the alert worker, before any detection
 * runs.
 */
export function isLiveAlertingEnabled(): boolean {
    return process.env[LIVE_ALERTING_ENV_KEY]?.trim().toLowerCase() === "true";
}
