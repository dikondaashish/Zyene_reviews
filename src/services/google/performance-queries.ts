import type { SupabaseClient } from "@supabase/supabase-js";

/** Inclusive last N calendar days (local) for dashboard defaults. */
export function dateRangeLastNDays(n: number): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (n - 1));
    return { start, end };
}

const IMPRESSION_KEYS = [
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
] as const;

export interface GooglePerformanceTotals {
    profileViews: number;
    callClicks: number;
    directionRequests: number;
    websiteClicks: number;
    /** Sum of daily rows (for debugging) */
    rawRowCount: number;
}

export interface DailyMetricPoint {
    date: string;
    profileViews: number;
    calls: number;
    directions: number;
    websiteClicks: number;
}

/**
 * Aggregate stored daily metrics for a business between `start` and `end` (inclusive, date-only).
 */
export async function getGooglePerformanceTotals(
    supabase: SupabaseClient,
    businessId: string,
    start: Date,
    end: Date
): Promise<GooglePerformanceTotals | null> {
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("google_performance_metrics")
        .select("metric_key, metric_date, value")
        .eq("business_id", businessId)
        .gte("metric_date", startStr)
        .lte("metric_date", endStr);

    if (error) {
        return null;
    }
    if (!data?.length) {
        return {
            profileViews: 0,
            callClicks: 0,
            directionRequests: 0,
            websiteClicks: 0,
            rawRowCount: 0,
        };
    }

    let profileViews = 0;
    let callClicks = 0;
    let directionRequests = 0;
    let websiteClicks = 0;

    for (const row of data) {
        const k = row.metric_key as string;
        const v = Number(row.value) || 0;
        if (IMPRESSION_KEYS.includes(k as (typeof IMPRESSION_KEYS)[number])) {
            profileViews += v;
        } else if (k === "CALL_CLICKS") {
            callClicks += v;
        } else if (k === "BUSINESS_DIRECTION_REQUESTS") {
            directionRequests += v;
        } else if (k === "WEBSITE_CLICKS") {
            websiteClicks += v;
        }
    }

    return {
        profileViews,
        callClicks,
        directionRequests,
        websiteClicks,
        rawRowCount: data.length,
    };
}

/**
 * Time series for charts: one row per date with summed impressions + engagement metrics.
 */
export async function getGooglePerformanceDailySeries(
    supabase: SupabaseClient,
    businessId: string,
    start: Date,
    end: Date
): Promise<DailyMetricPoint[]> {
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("google_performance_metrics")
        .select("metric_key, metric_date, value")
        .eq("business_id", businessId)
        .gte("metric_date", startStr)
        .lte("metric_date", endStr);

    if (error || !data?.length) {
        return [];
    }

    const byDate = new Map<
        string,
        { profileViews: number; calls: number; directions: number; websiteClicks: number }
    >();

    for (const row of data) {
        const d = row.metric_date as string;
        if (!byDate.has(d)) {
            byDate.set(d, { profileViews: 0, calls: 0, directions: 0, websiteClicks: 0 });
        }
        const bucket = byDate.get(d)!;
        const k = row.metric_key as string;
        const v = Number(row.value) || 0;
        if (IMPRESSION_KEYS.includes(k as (typeof IMPRESSION_KEYS)[number])) {
            bucket.profileViews += v;
        } else if (k === "CALL_CLICKS") {
            bucket.calls += v;
        } else if (k === "BUSINESS_DIRECTION_REQUESTS") {
            bucket.directions += v;
        } else if (k === "WEBSITE_CLICKS") {
            bucket.websiteClicks += v;
        }
    }

    return Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
            date,
            profileViews: v.profileViews,
            calls: v.calls,
            directions: v.directions,
            websiteClicks: v.websiteClicks,
        }));
}

export async function getGoogleSearchKeywords(
    supabase: SupabaseClient,
    businessId: string,
    limit: number
): Promise<Array<{ keyword: string; impressions: number; monthStart: string }>> {
    const { data, error } = await supabase
        .from("google_search_keyword_monthly")
        .select("keyword, impressions, month_start")
        .eq("business_id", businessId)
        .order("month_start", { ascending: false })
        .order("impressions", { ascending: false })
        .limit(limit * 3);

    if (error || !data) {
        return [];
    }

    const seen = new Set<string>();
    const out: Array<{ keyword: string; impressions: number; monthStart: string }> = [];
    for (const row of data) {
        const k = `${row.month_start}-${row.keyword}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({
            keyword: row.keyword as string,
            impressions: Number(row.impressions) || 0,
            monthStart: row.month_start as string,
        });
        if (out.length >= limit) break;
    }
    return out;
}

/** Rough discovery vs direct: keywords containing business name tokens vs not — heuristic until richer data exists. */
export function estimateDiscoverySplit(
    keywords: Array<{ keyword: string; impressions: number }>,
    businessName: string
): { discoveryPct: number; directPct: number } {
    const tokens = businessName
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 2);
    let directW = 0;
    let discW = 0;
    for (const { keyword, impressions } of keywords) {
        const low = keyword.toLowerCase();
        const looksDirect = tokens.some((t) => low.includes(t));
        if (looksDirect) {
            directW += impressions;
        } else {
            discW += impressions;
        }
    }
    const t = directW + discW;
    if (t === 0) {
        return { discoveryPct: 0, directPct: 0 };
    }
    return {
        directPct: Math.round((directW / t) * 100),
        discoveryPct: Math.round((discW / t) * 100),
    };
}
