import { fetchWithRetry } from "./business-profile";
import { createGoogleServiceError } from "./api-error";
import { normalizeGoogleLocationId } from "./location-id";

const BASE_PERFORMANCE = "https://businessprofileperformance.googleapis.com/v1";

/** Normalize stored resource names to the unobfuscated location id expected by Performance API. */
export function normalizePerformanceLocationId(raw: string | null | undefined): string | null {
    return normalizeGoogleLocationId(raw);
}

/** Daily metrics we sync (aligned with Phase 1 dashboard + analytics). */
export const DAILY_METRICS_SYNCED = [
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "BUSINESS_DIRECTION_REQUESTS",
    "CALL_CLICKS",
    "WEBSITE_CLICKS",
] as const;

export type DailyMetricKey = (typeof DAILY_METRICS_SYNCED)[number];

export interface DateParts {
    year: number;
    month: number;
    day: number;
}

export interface DatedValue {
    date?: DateParts;
    value?: string;
}

export interface TimeSeries {
    datedValues?: DatedValue[];
}

export interface DailyMetricTimeSeries {
    dailyMetric?: string;
    dailySubEntityType?: Record<string, unknown> | null;
    timeSeries?: TimeSeries;
}

export interface MultiDailyMetricTimeSeries {
    dailyMetricTimeSeries?: DailyMetricTimeSeries[];
}

export interface FetchMultiDailyMetricsResponse {
    multiDailyMetricTimeSeries?: MultiDailyMetricTimeSeries[];
}

export interface SearchKeywordCount {
    searchKeyword?: string;
    insightsValue?: { value?: string; threshold?: string };
}

export interface ListSearchKeywordsMonthlyResponse {
    searchKeywordsCounts?: SearchKeywordCount[];
    nextPageToken?: string;
}

function buildDailyRangeParams(start: Date, end: Date): URLSearchParams {
    const p = new URLSearchParams();
    p.set("dailyRange.start_date.year", String(start.getFullYear()));
    p.set("dailyRange.start_date.month", String(start.getMonth() + 1));
    p.set("dailyRange.start_date.day", String(start.getDate()));
    p.set("dailyRange.end_date.year", String(end.getFullYear()));
    p.set("dailyRange.end_date.month", String(end.getMonth() + 1));
    p.set("dailyRange.end_date.day", String(end.getDate()));
    return p;
}

/**
 * Fetches daily performance metrics for a location (unobfuscated location id).
 * @see https://developers.google.com/my-business/reference/performance/rest/v1/locations/fetchMultiDailyMetricsTimeSeries
 */
export async function fetchMultiDailyMetricsTimeSeries(
    accessToken: string,
    googleLocationId: string,
    start: Date,
    end: Date
): Promise<FetchMultiDailyMetricsResponse> {
    const loc = normalizePerformanceLocationId(googleLocationId);
    if (!loc) {
        throw new Error("Invalid or empty google_location_id for Performance API");
    }

    const params = buildDailyRangeParams(start, end);
    for (const m of DAILY_METRICS_SYNCED) {
        params.append("dailyMetrics", m);
    }

    const url = `${BASE_PERFORMANCE}/locations/${encodeURIComponent(loc)}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError("Business Profile Performance API", response.status, body);
    }

    return response.json() as Promise<FetchMultiDailyMetricsResponse>;
}

function buildMonthlyRangeParams(startMonth: DateParts, endMonth: DateParts): URLSearchParams {
    const p = new URLSearchParams();
    p.set("monthlyRange.start_month.year", String(startMonth.year));
    p.set("monthlyRange.start_month.month", String(startMonth.month));
    p.set("monthlyRange.end_month.year", String(endMonth.year));
    p.set("monthlyRange.end_month.month", String(endMonth.month));
    return p;
}

/**
 * Lists monthly search keyword impressions (paginated).
 * @see https://developers.google.com/my-business/reference/performance/rest/v1/locations.searchkeywords.impressions.monthly/list
 */
export async function listSearchKeywordImpressionsMonthly(
    accessToken: string,
    googleLocationId: string,
    startMonth: DateParts,
    endMonth: DateParts,
    pageToken?: string
): Promise<ListSearchKeywordsMonthlyResponse> {
    const loc = normalizePerformanceLocationId(googleLocationId);
    if (!loc) {
        throw new Error("Invalid or empty google_location_id for Performance API (keywords)");
    }

    const params = buildMonthlyRangeParams(startMonth, endMonth);
    params.set("pageSize", "100");
    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const url = `${BASE_PERFORMANCE}/locations/${encodeURIComponent(
        loc
    )}/searchkeywords/impressions/monthly?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError("Business Profile Performance API", response.status, body);
    }

    return response.json() as Promise<ListSearchKeywordsMonthlyResponse>;
}

/** Flatten API response into rows: metric_key, dimension_key, date string YYYY-MM-DD, value */
export function flattenDailyMetricsResponse(
    data: FetchMultiDailyMetricsResponse
): Array<{ metricKey: string; dimensionKey: string; dateStr: string; value: number }> {
    const out: Array<{ metricKey: string; dimensionKey: string; dateStr: string; value: number }> = [];

    const multi = data.multiDailyMetricTimeSeries || [];
    for (const block of multi) {
        const seriesList = block.dailyMetricTimeSeries || [];
        for (const series of seriesList) {
            const metric = series.dailyMetric || "UNKNOWN";
            const dimKey =
                series.dailySubEntityType && Object.keys(series.dailySubEntityType).length > 0
                    ? JSON.stringify(series.dailySubEntityType)
                    : "default";

            const dated = series.timeSeries?.datedValues || [];
            for (const dv of dated) {
                const d = dv.date;
                if (!d?.year || !d.month || !d.day) continue;
                const dateStr = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
                const raw = dv.value;
                const value = raw === undefined || raw === "" ? 0 : Math.round(parseFloat(raw) || 0);
                out.push({ metricKey: metric, dimensionKey: dimKey, dateStr, value });
            }
        }
    }

    return out;
}

export function parseKeywordImpressions(row: SearchKeywordCount): {
    keyword: string;
    impressions: number;
    isThreshold: boolean;
} {
    const keyword = row.searchKeyword || "";
    const iv = row.insightsValue;
    if (iv?.threshold !== undefined) {
        return { keyword, impressions: 0, isThreshold: true };
    }
    const v = iv?.value;
    const impressions = v === undefined || v === "" ? 0 : Math.round(parseFloat(v) || 0);
    return { keyword, impressions, isThreshold: false };
}
