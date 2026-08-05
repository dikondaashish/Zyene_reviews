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
