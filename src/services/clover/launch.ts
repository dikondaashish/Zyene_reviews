/**
 * Clover App Market launch handling.
 *
 * When a merchant installs or opens the app from the Clover App Market, Clover
 * redirects to the Site URL with `merchant_id`, `client_id` and `code` but no
 * `state` (we never started that flow). We cannot bind that code to a Zyene
 * business safely, so we restart OAuth from our own connect route, which signs
 * the user in, picks their active business and issues a fresh `state`.
 */

export const CLOVER_CONNECT_PATH = "/api/integrations/clover/connect";

export type CloverCallbackKind = "error" | "app_market_launch" | "oauth" | "missing_params";

export function classifyCloverCallback(params: URLSearchParams): CloverCallbackKind {
    if (params.get("error")) return "error";
    const code = params.get("code");
    const state = params.get("state");
    if (code && state) return "oauth";
    if (!state && (code || params.get("merchant_id"))) return "app_market_launch";
    return "missing_params";
}

/** Login URL that returns to the Clover connect route after sign-in. */
export function cloverLoginRedirectPath(businessId: string | null): string {
    const next = businessId
        ? `${CLOVER_CONNECT_PATH}?businessId=${encodeURIComponent(businessId)}`
        : CLOVER_CONNECT_PATH;
    return `/login?next=${encodeURIComponent(next)}`;
}
