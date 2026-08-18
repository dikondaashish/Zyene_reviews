import { describe, expect, it } from "vitest";

import {
    detectCitationAlerts,
    splitCitationWindows,
    MIN_BASELINE_CITATIONS,
    MIN_RECENT_CITATIONS,
} from "../../src/services/aeo/alerting/detect-citation-alerts";
import {
    detectRankAlert,
    MIN_CELLS_LOST,
    MIN_COMPARED_CELLS,
    MIN_RANK_DELTA,
    type GridCell,
} from "../../src/services/aeo/alerting/detect-rank-alerts";

const NOW = new Date("2026-08-11T00:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

function cited(url: string, days: number, times = 1) {
    return Array.from({ length: times }, () => ({ normalizedUrl: url, sampledAt: daysAgo(days) }));
}

describe("F8.2 citation alerts", () => {
    it("reports a page that was established and is now uncited", () => {
        const alerts = detectCitationAlerts({
            baseline: cited("https://a.com/x", 40, MIN_BASELINE_CITATIONS),
            recent: cited("https://a.com/other", 2, 1),
        });

        expect(alerts).toEqual([
            {
                direction: "lost",
                normalizedUrl: "https://a.com/x",
                baselineCitations: MIN_BASELINE_CITATIONS,
                recentCitations: 0,
            },
        ]);
    });

    it("ignores a page cited only once in the baseline", () => {
        const alerts = detectCitationAlerts({
            baseline: cited("https://a.com/x", 40, MIN_BASELINE_CITATIONS - 1),
            recent: [],
        });
        expect(alerts).toEqual([]);
    });

    it("reports a genuinely new page but not a single lucky appearance", () => {
        const corroborated = detectCitationAlerts({
            baseline: cited("https://a.com/old", 40, 3),
            recent: [...cited("https://a.com/old", 2, 1), ...cited("https://a.com/new", 2, MIN_RECENT_CITATIONS)],
        });
        expect(corroborated.map((a) => a.normalizedUrl)).toEqual(["https://a.com/new"]);

        const oneOff = detectCitationAlerts({
            baseline: cited("https://a.com/old", 40, 3),
            recent: [...cited("https://a.com/old", 2, 1), ...cited("https://a.com/new", 2, MIN_RECENT_CITATIONS - 1)],
        });
        expect(oneOff).toEqual([]);
    });

    it("fires nothing on a business with no baseline at all", () => {
        // Criterion #42's spirit: a first cycle must not alert on everything.
        const alerts = detectCitationAlerts({ baseline: [], recent: cited("https://a.com/x", 1, 5) });
        expect(alerts).toEqual([]);
    });

    it("orders losses before gains, so a digest leads with the actionable item", () => {
        const alerts = detectCitationAlerts({
            baseline: cited("https://a.com/lost", 40, 3),
            recent: cited("https://a.com/gained", 2, 3),
        });
        expect(alerts.map((a) => a.direction)).toEqual(["lost", "gained"]);
    });

    it("splits windows on the cutoff and drops unparseable timestamps", () => {
        const { baseline, recent } = splitCitationWindows(
            [
                { normalizedUrl: "a", sampledAt: daysAgo(30) },
                { normalizedUrl: "b", sampledAt: daysAgo(1) },
                { normalizedUrl: "c", sampledAt: "not-a-date" },
            ],
            new Date(NOW.getTime() - 14 * 86_400_000)
        );

        expect(baseline.map((f) => f.normalizedUrl)).toEqual(["a"]);
        expect(recent.map((f) => f.normalizedUrl)).toEqual(["b"]);
    });
});

describe("F8.3 rank alerts", () => {
    const grid = (ranks: (number | null)[]): GridCell[] =>
        ranks.map((rankPosition, i) => ({ row: 0, col: i, rankPosition }));

    it("alerts when the paired average worsens past the floor", () => {
        const previous = grid([1, 1, 1, 1, 1, 1]);
        const current = grid([3, 3, 3, 3, 3, 3]);

        const alert = detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current });

        expect(alert).not.toBeNull();
        expect(alert!.comparedCells).toBe(6);
        expect(alert!.rankDelta).toBe(2);
    });

    it("stays silent on movement below the practical floor", () => {
        const previous = grid([2, 2, 2, 2, 2, 2]);
        const current = grid(previous.map((_, i) => (i === 0 ? 3 : 2)));
        // One cell moving by one is an average delta of ~0.17.
        const alert = detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current });
        expect(alert).toBeNull();
        expect(MIN_RANK_DELTA).toBe(1);
    });

    it("refuses to average over too few paired cells", () => {
        const size = MIN_COMPARED_CELLS - 1;
        const previous = grid(Array(size).fill(1));
        const current = grid(Array(size).fill(15));

        expect(detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current })).toBeNull();
    });

    it("alerts on falling out of the pack even when the survivors held rank", () => {
        const previous = grid([1, 1, 1, 1, 1, 1]);
        const current = grid([1, 1, 1, null, null, null]);

        const alert = detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current });

        expect(alert).not.toBeNull();
        expect(alert!.cellsLostFromPack).toBe(MIN_CELLS_LOST);
        // The three lost cells must not be averaged in as a rank.
        expect(alert!.currentAverageRank).toBe(0);
    });

    it("never treats a dropped-out cell as a rank number", () => {
        const previous = grid([1, 1, 1, 1, 1, 1]);
        const current = grid([1, 1, 1, 1, 1, null]);

        const alert = detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current });

        // Five paired cells all held rank 1, and one dropped out. Below both
        // floors, so no alert — and crucially no invented rank for the drop.
        expect(alert).toBeNull();
    });

    it("compares only cells present in both runs", () => {
        const previous = grid([1, 1, 1, 1, 1, 1]);
        // Coverage shrank; the extra previous cells must not skew the average.
        const current = [{ row: 0, col: 0, rankPosition: 9 }];

        const alert = detectRankAlert({ keyword: "bbq", previousCells: previous, currentCells: current });
        expect(alert).toBeNull();
    });
});
