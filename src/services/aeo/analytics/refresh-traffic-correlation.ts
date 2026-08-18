import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { fetchSearchConsolePageDays } from "@/services/google/search-console-page-days";
import { normalizeUrlForMatch } from "@/services/aeo/crawler/finding-prompt-linkage";
import { correlateCitationTraffic } from "./citation-traffic-correlation";

type Admin = SupabaseClient<Database>;

export async function refreshCitationTrafficCorrelation(db: Admin, businessId: string) {
    const [businessResult, platformResult] = await Promise.all([
        db.from("businesses").select("website").eq("id", businessId).single(),
        db.from("review_platforms").select("id, granted_scopes").eq("business_id", businessId)
            .eq("platform", "google").maybeSingle(),
    ]);
    const platform = platformResult.data;
    const website = businessResult.data?.website;
    if (!platform || !website) return { skipped: "search_console_not_connected" as const };
    const end = new Date(Date.now() - 2 * 86_400_000);
    const start = new Date(end.getTime() - 89 * 86_400_000);
    const date = (value: Date) => value.toISOString().slice(0, 10);
    const { accessToken } = await getValidGoogleToken(platform.id);
    if (!accessToken) return { skipped: "google_token_unavailable" as const };
    const gsc = await fetchSearchConsolePageDays(accessToken, platform.granted_scopes, {
        siteUrl: website, startDate: date(start), endDate: date(end), rowLimit: 25_000,
    });
    if (!gsc.ok) return { skipped: gsc.reason };
    const changesResult = await db.from("aeo_citation_changes" as never)
        .select("normalized_url, detected_at" as never).eq("business_id" as never, businessId)
        .gte("detected_at" as never, start.toISOString()).lte("detected_at" as never, end.toISOString());
    const { data: changes, error } = changesResult as unknown as {
        data: { normalized_url: string; detected_at: string }[] | null; error: { message: string } | null;
    };
    if (error) throw new Error(`Citation changes failed: ${error.message}`);
    const events = new Map<string, number>();
    for (const row of changes ?? []) {
        const key = `${row.detected_at.slice(0, 10)}:${row.normalized_url}`;
        events.set(key, (events.get(key) ?? 0) + 1);
    }
    const byPage = new Map<string, { date: string; citationEvents: number; clicks: number }[]>();
    for (const row of gsc.data) {
        const url = normalizeUrlForMatch(row.page);
        const fact = { date: row.date, clicks: row.clicks, citationEvents: events.get(`${row.date}:${url}`) ?? 0 };
        byPage.set(url, [...(byPage.get(url) ?? []), fact]);
    }
    let persisted = 0;
    for (const [url, facts] of byPage) {
        const result = correlateCitationTraffic(facts);
        const write = await db.from("aeo_citation_traffic_correlations" as never).upsert({
            business_id: businessId, normalized_url: url, window_start: date(start), window_end: date(end),
            observation_days: result.overlappingDays, correlation: result.correlation,
            eligible: result.overlappingDays >= 7 && result.correlation !== null,
            interpretation: result.interpretation, calculated_at: new Date().toISOString(),
        } as never, { onConflict: "business_id,normalized_url,window_start,window_end" });
        if (write.error) throw new Error(`Correlation upsert failed: ${write.error.message}`);
        persisted += 1;
    }
    return { persisted };
}
