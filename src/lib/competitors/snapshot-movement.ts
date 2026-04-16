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
        const first = meaningful[0];
        const last = meaningful[meaningful.length - 1];
        if (!first || !last || meaningful.length < 2) {
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
