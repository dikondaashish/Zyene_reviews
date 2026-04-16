import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "./sync-service";
import {
    fetchMultiDailyMetricsTimeSeries,
    flattenDailyMetricsResponse,
    listSearchKeywordImpressionsMonthly,
    normalizePerformanceLocationId,
    parseKeywordImpressions,
    type DateParts,
} from "./performance";
import {
    PERFORMANCE_DAILY_DAYS,
    PERFORMANCE_KEYWORD_MONTHS,
    PERFORMANCE_METRICS_BATCH_SIZE,
} from "./constants";
import * as Sentry from "@sentry/nextjs";

export interface PerformanceSyncResult {
    success: boolean;
    dailyRowsUpserted: number;
    keywordRowsUpserted: number;
    error?: string;
    /** API returned 200 but no daily points were parsed (wrong location id, empty range, or response shape drift). */
    emptyDailySeries?: boolean;
}

/** First day of calendar month */
function monthStartDate(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, "0")}-01`;
}

/**
 * Syncs Google Business Profile Performance API data for a single `review_platforms` row (Google).
 * - Daily metrics for the last `dailyDays` days (default 30)
 * - Monthly search keywords for the last `keywordMonths` months (default 3), all pages
 */
export async function syncGooglePerformanceForPlatform(
    platformId: string,
    options?: { dailyDays?: number; keywordMonths?: number }
): Promise<PerformanceSyncResult> {
    const dailyDays = options?.dailyDays ?? PERFORMANCE_DAILY_DAYS;
    const keywordMonths = options?.keywordMonths ?? PERFORMANCE_KEYWORD_MONTHS;

    const admin = createAdminClient();

    const { data: platform, error: pErr } = await admin
        .from("review_platforms")
        .select("id, business_id, platform, google_location_id")
        .eq("id", platformId)
        .single();

    if (pErr || !platform) {
        return { success: false, dailyRowsUpserted: 0, keywordRowsUpserted: 0, error: "Platform not found" };
    }

    if (platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, dailyRowsUpserted: 0, keywordRowsUpserted: 0, error: "Not a Google platform or missing location id" };
    }

    const locationId = platform.google_location_id;
    const businessId = platform.business_id;
    const normalizedLoc = normalizePerformanceLocationId(locationId);
    if (!normalizedLoc) {
        return {
            success: false,
            dailyRowsUpserted: 0,
            keywordRowsUpserted: 0,
            error: "Invalid google_location_id for Performance API",
        };
    }

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) {
            throw new Error("No access token");
        }

        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - (dailyDays - 1));

        const raw = await fetchMultiDailyMetricsTimeSeries(accessToken, locationId, start, end);
        const flat = flattenDailyMetricsResponse(raw);

        if (flat.length === 0) {
            const preview = JSON.stringify(raw).slice(0, 800);
            console.warn(
                `[PerformanceSync] No daily metric points for platform ${platformId} (location ${normalizedLoc}). Raw preview:`,
                preview
            );
            Sentry.captureMessage("Google Performance API returned empty daily series", {
                level: "warning",
                extra: { platformId, normalizedLocationId: normalizedLoc, rawPreview: preview },
            });
        }

        const dailyRows = flat.map((r) => ({
            review_platform_id: platformId,
            business_id: businessId,
            metric_date: r.dateStr,
            metric_key: r.metricKey,
            dimension_key: r.dimensionKey,
            value: r.value,
        }));

        let dailyUpserted = 0;
        for (let i = 0; i < dailyRows.length; i += PERFORMANCE_METRICS_BATCH_SIZE) {
            const chunk = dailyRows.slice(i, i + PERFORMANCE_METRICS_BATCH_SIZE);
            if (chunk.length === 0) continue;
            const { error } = await admin.from("google_performance_metrics").upsert(chunk, {
                onConflict: "review_platform_id,metric_date,metric_key,dimension_key",
            });
            if (error) {
                console.error("[PerformanceSync] daily upsert error:", error);
                Sentry.captureException(error);
                throw error;
            }
            dailyUpserted += chunk.length;
        }

        let keywordUpserted = 0;
        const now = new Date();
        for (let m = 0; m < keywordMonths; m++) {
            const ref = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const y = ref.getFullYear();
            const month = ref.getMonth() + 1;
            const startParts: DateParts = { year: y, month, day: 1 };
            const endParts: DateParts = { year: y, month, day: 1 };

            let pageToken: string | undefined;
            do {
                const kwResp = await listSearchKeywordImpressionsMonthly(
                    accessToken,
                    normalizedLoc,
                    startParts,
                    endParts,
                    pageToken
                );
                const counts = kwResp.searchKeywordsCounts || [];
                const monthStart = monthStartDate(y, month);

                const kwRows = counts.map((c) => {
                    const parsed = parseKeywordImpressions(c);
                    return {
                        review_platform_id: platformId,
                        business_id: businessId,
                        month_start: monthStart,
                        keyword: parsed.keyword,
                        impressions: parsed.impressions,
                        is_threshold: parsed.isThreshold,
                    };
                });

                if (kwRows.length > 0) {
                    const { error: kwErr } = await admin.from("google_search_keyword_monthly").upsert(kwRows, {
                        onConflict: "review_platform_id,month_start,keyword",
                    });
                    if (kwErr) {
                        console.error("[PerformanceSync] keyword upsert error:", kwErr);
                        Sentry.captureException(kwErr);
                        throw kwErr;
                    }
                    keywordUpserted += kwRows.length;
                }

                pageToken = kwResp.nextPageToken;
            } while (pageToken);
        }

        await admin
            .from("review_platforms")
            .update({ google_performance_synced_at: new Date().toISOString() })
            .eq("id", platformId);

        return {
            success: true,
            dailyRowsUpserted: dailyUpserted,
            keywordRowsUpserted: keywordUpserted,
            emptyDailySeries: flat.length === 0,
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[PerformanceSync] failed:", msg);
        Sentry.captureException(e);
        return { success: false, dailyRowsUpserted: 0, keywordRowsUpserted: 0, error: msg };
    }
}
