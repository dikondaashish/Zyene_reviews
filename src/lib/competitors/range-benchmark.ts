/**
 * Pure helpers for range-scoped competitor benchmark (tests + UI).
 */

export type SnapshotRow = {
    competitor_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
};

export type CompetitorRow = {
    id: string;
    average_rating: number | null;
    total_reviews: number | null;
};

/** First / last snapshot per competitor within the range (by captured_at). */
export function firstLastSnapshotsByCompetitor(
    snapshots: SnapshotRow[]
): Map<string, { first: SnapshotRow; last: SnapshotRow }> {
    const byId = new Map<string, SnapshotRow[]>();
    for (const s of snapshots) {
        if (!byId.has(s.competitor_id)) byId.set(s.competitor_id, []);
        byId.get(s.competitor_id)!.push(s);
    }
    const out = new Map<string, { first: SnapshotRow; last: SnapshotRow }>();
    for (const [id, rows] of byId) {
        const sorted = rows.slice().sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (first && last) out.set(id, { first, last });
    }
    return out;
}

/** Average of end-of-period ratings (last snapshot per competitor), with fallback to current competitor row. */
export function marketAverageEndRating(
    competitors: CompetitorRow[],
    snapshots: SnapshotRow[]
): { avgEnd: number; usedFallback: boolean } {
    const fl = firstLastSnapshotsByCompetitor(snapshots);
    let sum = 0;
    let n = 0;
    let usedFallback = false;
    for (const c of competitors) {
        const pair = fl.get(c.id);
        if (pair) {
            sum += Number(pair.last.average_rating || 0);
            n++;
        } else {
            sum += Number(c.average_rating || 0);
            n++;
            usedFallback = true;
        }
    }
    return { avgEnd: n > 0 ? sum / n : 0, usedFallback };
}

export function averageRatingFromReviewRatings(ratings: number[]): number | null {
    if (ratings.length === 0) return null;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function isCompetitorAlertEventType(eventType: string): boolean {
    return eventType.startsWith("competitor.alert.");
}
