import { gscFetch, type GscOutcome, type GscQueryOptions } from "./search-console";

export type GscPageDayRow = { date: string; page: string; clicks: number; impressions: number };

/** Daily page facts used by F2.6. Raw queries and user identities are never exported. */
export async function fetchSearchConsolePageDays(
    accessToken: string,
    grantedScopes: string | null,
    options: GscQueryOptions
): Promise<GscOutcome<GscPageDayRow[]>> {
    const encoded = encodeURIComponent(options.siteUrl);
    const result = await gscFetch<{
        rows?: { keys?: string[]; clicks?: number; impressions?: number }[];
    }>(`/sites/${encoded}/searchAnalytics/query`, accessToken, grantedScopes, {
        method: "POST",
        body: JSON.stringify({
            startDate: options.startDate, endDate: options.endDate,
            dimensions: ["date", "page"], rowLimit: options.rowLimit ?? 25_000,
        }),
    });
    if (!result.ok) return result;
    return { ok: true, data: (result.data.rows ?? []).flatMap((row) => {
        const date = row.keys?.[0];
        const page = row.keys?.[1];
        return date && page ? [{ date, page, clicks: row.clicks ?? 0, impressions: row.impressions ?? 0 }] : [];
    }) };
}
