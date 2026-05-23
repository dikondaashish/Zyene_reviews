import type { DashboardStatsState } from "./load-dashboard-stats-state";

export function applyDashboardTrendChart(
    stats: DashboardStatsState,
    trendRaw: Array<{ review_date: string }>,
): void {
    if (trendRaw.length === 0) return;
    const dayMap: Record<string, number> = {};
    trendRaw.forEach((r) => {
        const day = new Date(r.review_date).toISOString().split("T")[0];
        dayMap[day] = (dayMap[day] || 0) + 1;
    });
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().split("T")[0];
        if (!dayMap[key]) dayMap[key] = 0;
    }
    stats.trendData = Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, count]) => ({ day, count }));
}

export function applyDashboardRatingDistribution(
    stats: DashboardStatsState,
    ratingRaw: Array<{ rating: number }>,
): void {
    if (ratingRaw.length === 0) return;
    const ratingMap: Record<number, number> = {};
    ratingRaw.forEach((r) => {
        ratingMap[r.rating] = (ratingMap[r.rating] || 0) + 1;
    });
    stats.ratingData = Object.entries(ratingMap).map(([rating, count]) => ({
        rating: Number(rating),
        count,
    }));
}
