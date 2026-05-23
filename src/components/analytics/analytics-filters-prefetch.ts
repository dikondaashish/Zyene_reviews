import { rangeToDays, type RangeKey } from "@/lib/query/date-range-keys";

export async function prefetchAnalyticsRange(range: RangeKey) {
    const response = await fetch(`/api/v1/analytics?days=${rangeToDays(range)}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch analytics range");
    }
    return response.json();
}

export async function prefetchAnalyticsFullRange(range: RangeKey, platform: string) {
    const response = await fetch(`/api/analytics/range-data?range=${range}&platform=${platform}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch full analytics range");
    }
    return response.json();
}

export const ANALYTICS_FILTER_RANGES: Array<{ label: string; value: RangeKey }> = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "12 Months", value: "12m" },
];
