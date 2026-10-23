/**
 * Pure trend math for competitor snapshots in a selected window (tests + UI + CSV).
 */

export type SnapshotMovementInput = {
    competitor_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
};

export type CompetitorMovementRow = {
    competitorId: string;
    name: string;
    ratingDelta: number | null;
    reviewsDelta: number | null;
    /** True when at least two snapshots exist in the window (first vs last is meaningful). */
    hasBaseline: boolean;
};

/**
 * Google sometimes alternates between two review counts for the same place (for example a
 * chain whose listings get merged on some days). Comparing against a snapshot from the
 * other series produced swings like -448 in a month. The baseline is therefore the earliest
 * snapshot in the window whose count is close to the latest one.
 */
const SERIES_TOLERANCE_RATIO = 0.03;
const SERIES_TOLERANCE_MIN = 20;

/** True when two review totals plausibly come from the same Google count, not the "other" one. */
export function isSameReviewSeries(a: number, b: number): boolean {
    return Math.abs(a - b) <= Math.max(SERIES_TOLERANCE_MIN, Math.max(a, b) * SERIES_TOLERANCE_RATIO);
}

function sameSeriesBaseline(rows: SnapshotMovementInput[], last: SnapshotMovementInput): SnapshotMovementInput | undefined {
    const latest = Number(last.total_reviews);
    return rows.find((r) => r !== last && isSameReviewSeries(Number(r.total_reviews), latest));
}

/**
 * What an alert should compare a new reading against. Normally the latest snapshot; when the
 * new total jumps to the other series, the newest recent snapshot from the same series, so a
 * flip back is not reported as hundreds of new (or lost) reviews and a rating change.
 */
export function alertBaseline<T extends { average_rating: number; total_reviews: number }>(
    latest: T, recentNewestFirst: T[], currReviews: number,
): T {
    if (isSameReviewSeries(Number(latest.total_reviews), currReviews)) return latest;
    return recentNewestFirst.find((r) => isSameReviewSeries(Number(r.total_reviews), currReviews)) ?? latest;
}

export function computeCompetitorMovementRows(
    competitors: Array<{ id: string; name: string }>,
    snapshotRows: SnapshotMovementInput[]
): CompetitorMovementRow[] {
    const byCompetitor = new Map<string, SnapshotMovementInput[]>();
    for (const s of snapshotRows) {
        if (!byCompetitor.has(s.competitor_id)) byCompetitor.set(s.competitor_id, []);
        byCompetitor.get(s.competitor_id)!.push(s);
    }

    return competitors.map((c) => {
        const rows = (byCompetitor.get(c.id) || [])
            .slice()
            .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());

        const meaningful = rows.filter((r) => Number(r.total_reviews) > 0 || Number(r.average_rating) > 0);
        const last = meaningful[meaningful.length - 1];
        const first = last ? sameSeriesBaseline(meaningful, last) : undefined;
        if (!first || !last) {
            return {
                competitorId: c.id,
                name: c.name,
                ratingDelta: null,
                reviewsDelta: null,
                hasBaseline: false,
            };
        }
        return {
            competitorId: c.id,
            name: c.name,
            ratingDelta: Number(last.average_rating) - Number(first.average_rating),
            reviewsDelta: Number(last.total_reviews) - Number(first.total_reviews),
            hasBaseline: true,
        };
    });
}
