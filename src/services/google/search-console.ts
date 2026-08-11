import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { logger } from "@/lib/logger";
import { grantIncludesSearchConsole } from "./oauth-scopes";

/**
 * Google Search Console (E-2), read-only.
 *
 * Access is INCREMENTAL — a business can have a perfectly healthy Google
 * connection and still have no Search Console grant, because the sensitive
 * scope is requested separately (see oauth-scopes.ts). Every entry point here
 * therefore returns a discriminated result rather than throwing, so a caller
 * cannot accidentally render "not connected" as "no data".
 *
 * That distinction is the whole reason this module reports so many states: an
 * empty performance table means the site genuinely got no clicks; a missing
 * grant means we never looked. Collapsing them would put a confident zero in
 * front of a customer.
 */

const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3";

export type GscOutcome<T> =
    | { ok: true; data: T }
    | { ok: false; reason: "scope_not_granted" }
    /** Token rejected — revoked, expired beyond refresh, or app access removed. */
    | { ok: false; reason: "unauthorized"; detail: string }
    /** Authenticated, but this Google account cannot see this property. */
    | { ok: false; reason: "no_property_access"; detail: string }
    /** Search Console API not enabled on the Cloud project. */
    | { ok: false; reason: "api_disabled"; detail: string }
    | { ok: false; reason: "rate_limited"; detail: string }
    | { ok: false; reason: "upstream"; detail: string };

export type GscProperty = {
    /** e.g. `sc-domain:example.com` or `https://example.com/`. */
    siteUrl: string;
    /** siteOwner | siteFullUser | siteRestrictedUser | siteUnverifiedUser. */
    permissionLevel: string;
};

export type GscQueryRow = {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    /** 1-based average position. Lower is better. */
    position: number;
};

async function gscFetch<T>(
    path: string,
    accessToken: string,
    grantedScopes: string | null,
    init?: RequestInit
): Promise<GscOutcome<T>> {
    // Checked BEFORE the request. Calling without the scope returns a 403 that
    // is indistinguishable from "this account cannot see that property", and
    // guessing between them is how a connected customer gets told their site
    // has no data.
    if (!grantIncludesSearchConsole(grantedScopes)) {
        return { ok: false, reason: "scope_not_granted" };
    }

    let response: Response;
    try {
        response = await fetchWithTimeout(`${API_BASE}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
        });
    } catch (error) {
        return {
            ok: false,
            reason: "upstream",
            detail: error instanceof Error ? error.message : String(error),
        };
    }

    if (response.ok) {
        return { ok: true, data: (await response.json()) as T };
    }

    const body = await response.text().catch(() => "");
    const detail = body.slice(0, 300);

    if (response.status === 401) return { ok: false, reason: "unauthorized", detail };
    if (response.status === 429) return { ok: false, reason: "rate_limited", detail };
    if (response.status === 403) {
        // Google uses 403 for both "API not enabled on the project" and "this
        // account lacks access to that property". Only the body separates them,
        // and they need completely different fixes — one is ours, one is the
        // customer's.
        const disabled = /accessNotConfigured|SERVICE_DISABLED|has not been used in project/i.test(body);
        return disabled
            ? { ok: false, reason: "api_disabled", detail }
            : { ok: false, reason: "no_property_access", detail };
    }
    return { ok: false, reason: "upstream", detail: `HTTP ${response.status}: ${detail}` };
}

/** Properties this grant can read. Empty is a real answer: verified none. */
export async function listSearchConsoleProperties(
    accessToken: string,
    grantedScopes: string | null
): Promise<GscOutcome<GscProperty[]>> {
    const result = await gscFetch<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
        "/sites",
        accessToken,
        grantedScopes
    );
    if (!result.ok) return result;

    return {
        ok: true,
        data: (result.data.siteEntry ?? []).map((entry) => ({
            siteUrl: entry.siteUrl,
            permissionLevel: entry.permissionLevel,
        })),
    };
}

export type GscQueryOptions = {
    siteUrl: string;
    /** ISO date, inclusive. */
    startDate: string;
    endDate: string;
    rowLimit?: number;
};

/**
 * Top queries for a property.
 *
 * Search Console data lags roughly two days and is subject to Google's own
 * privacy filtering, so totals here will not reconcile exactly with any other
 * source. Callers presenting this next to GBP or sampling data must not imply
 * the two are measuring the same window.
 */
export async function fetchSearchConsoleQueries(
    accessToken: string,
    grantedScopes: string | null,
    options: GscQueryOptions
): Promise<GscOutcome<GscQueryRow[]>> {
    const encoded = encodeURIComponent(options.siteUrl);
    const result = await gscFetch<{
        rows?: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[];
    }>(`/sites/${encoded}/searchAnalytics/query`, accessToken, grantedScopes, {
        method: "POST",
        body: JSON.stringify({
            startDate: options.startDate,
            endDate: options.endDate,
            dimensions: ["query"],
            rowLimit: options.rowLimit ?? 100,
        }),
    });

    if (!result.ok) return result;

    return {
        ok: true,
        data: (result.data.rows ?? []).map((row) => ({
            query: row.keys?.[0] ?? "",
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        })).filter((row) => row.query.length > 0),
    };
}

/** Human-readable reason, for surfacing in the UI rather than a raw status. */
export function describeGscFailure(reason: Exclude<GscOutcome<never>, { ok: true }>["reason"]): string {
    switch (reason) {
        case "scope_not_granted":
            return "Search Console access has not been granted yet. Connect it from Integrations.";
        case "unauthorized":
            return "Google rejected the saved credentials. Reconnect Google from Integrations.";
        case "no_property_access":
            return "This Google account cannot access that Search Console property.";
        case "api_disabled":
            return "The Search Console API is not enabled on the Google Cloud project.";
        case "rate_limited":
            return "Google rate-limited the Search Console request. Try again shortly.";
        default:
            return "Search Console is temporarily unavailable.";
    }
}

export function logGscFailure(businessId: string, outcome: Exclude<GscOutcome<never>, { ok: true }>): void {
    logger.warn({ businessId, reason: outcome.reason }, "Search Console request did not succeed");
}
