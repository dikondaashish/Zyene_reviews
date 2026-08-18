/**
 * F8.3 — local-pack rank movement, from geo-grid cell drops.
 *
 * Scoped deliberately to the geo-grid, which is the one surface in this
 * codebase that stores a real, exact rank per measurement
 * (`aeo_geo_grid_points.rank_position`). Classic-organic position is NOT
 * alerted on here: nothing stores an organic rank as a number — the SERP
 * adapter serialises results into answer text and the brand matcher derives a
 * mention ordinal from prose position. Alerting on that as though it were a
 * Google ranking would dress a text-position heuristic up as a rank, which is
 * the exact class of claim this module exists to avoid. F8.1 already alerts on
 * that signal honestly, as visibility.
 *
 * The comparison is PAIRED — only cells searched successfully in both runs
 * count. Averaging each run over whatever cells it happened to cover, then
 * diffing the averages, moves the number whenever coverage changes, which
 * would fire "your rank dropped" every time a few cells failed.
 */

export type GridCell = {
    row: number;
    col: number;
    /** Null means searched but absent from the local pack — not a rank. */
    rankPosition: number | null;
};

export type RankAlert = {
    keyword: string;
    /** Cells compared in both runs. The alert's whole basis. */
    comparedCells: number;
    previousAverageRank: number;
    currentAverageRank: number;
    /** Positive means worse — rank numbers grow as position degrades. */
    rankDelta: number;
    /** Cells that were in the pack before and are not now. */
    cellsLostFromPack: number;
};

/** Below this, a paired average is too thin to be worth interrupting anyone. */
export const MIN_COMPARED_CELLS = 5;

/**
 * Average local-pack position is noisy between runs. A full position of
 * movement across the paired set is the practical floor — the same
 * "significant AND meaningful" posture F8.1 takes with its 15-point gate.
 */
export const MIN_RANK_DELTA = 1;

/** Losing the pack entirely in this many cells is worth an alert on its own. */
export const MIN_CELLS_LOST = 3;

function cellKey(cell: GridCell): string {
    return `${cell.row}:${cell.col}`;
}

/**
 * Compares two runs of the SAME keyword. Passing two different keywords would
 * compare unrelated measurements, so the caller supplies the keyword and is
 * responsible for only pairing runs that share it.
 */
export function detectRankAlert(input: {
    keyword: string;
    previousCells: readonly GridCell[];
    currentCells: readonly GridCell[];
}): RankAlert | null {
    const previous = new Map(input.previousCells.map((c) => [cellKey(c), c]));

    let comparedCells = 0;
    let previousTotal = 0;
    let currentTotal = 0;
    let cellsLostFromPack = 0;

    for (const current of input.currentCells) {
        const before = previous.get(cellKey(current));
        if (!before) continue;

        // Ranked in both: contributes to the paired average.
        if (before.rankPosition !== null && current.rankPosition !== null) {
            comparedCells += 1;
            previousTotal += before.rankPosition;
            currentTotal += current.rankPosition;
            continue;
        }

        // Was in the pack, now is not. Counted as a loss, never folded into the
        // average — there is no rank to average, and substituting a sentinel
        // would invent one.
        if (before.rankPosition !== null && current.rankPosition === null) {
            cellsLostFromPack += 1;
        }
    }

    const enoughCells = comparedCells >= MIN_COMPARED_CELLS;
    const previousAverageRank = enoughCells ? previousTotal / comparedCells : 0;
    const currentAverageRank = enoughCells ? currentTotal / comparedCells : 0;
    const rankDelta = currentAverageRank - previousAverageRank;

    const worsenedOnAverage = enoughCells && rankDelta >= MIN_RANK_DELTA;
    const lostGround = cellsLostFromPack >= MIN_CELLS_LOST;

    if (!worsenedOnAverage && !lostGround) return null;

    return {
        keyword: input.keyword,
        comparedCells,
        previousAverageRank,
        currentAverageRank,
        rankDelta,
        cellsLostFromPack,
    };
}
