import { grantIncludesSearchConsole } from "@/services/google/oauth-scopes";
import {
    listSearchConsoleProperties,
    fetchSearchConsoleQueries,
    describeGscFailure,
    logGscFailure,
    type GscQueryRow,
} from "@/services/google/search-console";
import { getValidGoogleToken } from "@/services/google/sync-service";

export type SearchConsoleSectionContent =
    | { kind: "error"; message: string }
    | { kind: "no_properties" }
    | { kind: "ok"; siteUrl: string; queries: GscQueryRow[]; startDate: string; endDate: string };

/**
 * E-2: Search Console data for the dashboard, or null to omit the section
 * entirely — same reasoning as `aeoVisibility`: a business that never
 * granted this scope has not "measured zero," it has not looked, and those
 * must never render the same way. The connect entry point lives on the
 * Integrations card, not here.
 */
export async function loadSearchConsoleSection(
    businessId: string,
    platformId: string,
    grantedScopes: string | null
): Promise<SearchConsoleSectionContent | null> {
    if (!grantIncludesSearchConsole(grantedScopes)) return null;

    const { accessToken } = await getValidGoogleToken(platformId);
    if (!accessToken) return { kind: "error", message: "Google connection needs to be reconnected." };

    const propsResult = await listSearchConsoleProperties(accessToken, grantedScopes);
    if (!propsResult.ok) {
        logGscFailure(businessId, propsResult);
        return { kind: "error", message: describeGscFailure(propsResult.reason) };
    }
    if (propsResult.data.length === 0) return { kind: "no_properties" };

    // Prefer a verified property; siteOwner/siteFullUser are the only levels
    // that can read search analytics, not just see the entry exists.
    const site =
        propsResult.data.find((p) => p.permissionLevel === "siteOwner") ??
        propsResult.data.find((p) => p.permissionLevel === "siteFullUser") ??
        propsResult.data[0];

    const now = new Date();
    // GSC data lags ~2 days; ending "today" would just return an empty tail.
    const end = new Date(now);
    end.setDate(end.getDate() - 3);
    const start = new Date(end);
    start.setDate(start.getDate() - 27);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const queriesResult = await fetchSearchConsoleQueries(accessToken, grantedScopes, {
        siteUrl: site.siteUrl,
        startDate,
        endDate,
        rowLimit: 10,
    });
    if (!queriesResult.ok) {
        logGscFailure(businessId, queriesResult);
        return { kind: "error", message: describeGscFailure(queriesResult.reason) };
    }

    return { kind: "ok", siteUrl: site.siteUrl, queries: queriesResult.data, startDate, endDate };
}
