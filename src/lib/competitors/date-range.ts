/**
 * Single source of truth for Competitor Watch UI range keys and window start.
 * Use everywhere server queries, charts, and labels reference the same period.
 */

export type CompetitorRangeKey = "7d" | "30d" | "90d" | "12m";

export function normalizeCompetitorRange(raw: string | undefined): CompetitorRangeKey {
    if (raw === "7d" || raw === "30d" || raw === "90d" || raw === "12m") return raw;
    return "30d";
}

/** Start of the lookback window (inclusive), relative to `now`. */
export function getCompetitorRangeStart(range: CompetitorRangeKey, now: Date = new Date()): Date {
    if (range === "12m") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        return d;
    }
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function competitorRangeLabel(range: CompetitorRangeKey): string {
    switch (range) {
        case "7d":
            return "7 days";
        case "30d":
            return "30 days";
        case "90d":
            return "90 days";
        case "12m":
            return "12 months";
        default:
            return "30 days";
    }
}
