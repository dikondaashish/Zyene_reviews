export type AnalyticsRange = "7d" | "30d" | "90d" | "12m";

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeAnalyticsRange(raw: string | null | undefined): AnalyticsRange {
    if (raw === "7d" || raw === "30d" || raw === "90d" || raw === "12m") {
        return raw;
    }
    return "30d";
}

export function analyticsRangeLabel(range: AnalyticsRange): string {
    if (range === "7d") return "Last 7 Days";
    if (range === "30d") return "Last 30 Days";
    if (range === "90d") return "Last 90 Days";
    return "Last 12 Months";
}

export function getAnalyticsPeriods(
    rangeRaw: string | null | undefined,
    nowInput?: Date
): {
    range: AnalyticsRange;
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
} {
    const range = normalizeAnalyticsRange(rangeRaw);
    const now = nowInput ? new Date(nowInput) : new Date();
    const currentEnd = new Date(now);

    let currentStart: Date;
    let previousStart: Date;

    if (range === "12m") {
        currentStart = new Date(now);
        currentStart.setFullYear(currentStart.getFullYear() - 1);

        previousStart = new Date(currentStart);
        previousStart.setFullYear(previousStart.getFullYear() - 1);
    } else {
        const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
        currentStart = new Date(now.getTime() - days * DAY_MS);
        previousStart = new Date(currentStart.getTime() - days * DAY_MS);
    }

    return {
        range,
        currentStart,
        currentEnd,
        previousStart,
        previousEnd: currentStart,
    };
}

export function toMonthStartIso(date: Date): string {
    const d = new Date(date);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
}
