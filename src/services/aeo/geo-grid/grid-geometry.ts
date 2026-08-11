/**
 * Laying out a geo-grid.
 *
 * This replaces the pre-Phase-1 heatmap, which built cell labels from the
 * business's city string and derived a "rank" from its star rating — no
 * coordinate was ever used and no search was ever run. Everything here produces
 * real coordinates that get really searched.
 *
 * Kept pure and separate from the sampling so the geometry can be checked
 * against known distances, which is the part that silently goes wrong.
 */

export type GridPoint = {
    /** 0-based, top-left origin: row 0 is the NORTHERNMOST row. */
    row: number;
    col: number;
    lat: number;
    lng: number;
    /** True for the single centre cell, where the business actually is. */
    isCenter: boolean;
};

export type GridSpec = {
    centerLat: number;
    centerLng: number;
    /** Odd only, so there is exactly one centre cell. */
    size: 5 | 7 | 9;
    spacingMeters: number;
};

/** Mean meridional radius; good to ~0.5% at the scales a local grid covers. */
const METERS_PER_DEGREE_LAT = 111_320;

/** Latitude beyond which longitude spacing stops being meaningful. */
const MAX_ABS_LAT = 85;

/**
 * Metres per degree of longitude shrinks with latitude — by cos(lat).
 *
 * Ignoring this is the classic geo-grid bug: a grid laid out with a fixed
 * degree step is correct at the equator and progressively squashed east-west as
 * you move away from it. At Austin (~30°N) a naive grid is already 13% too
 * narrow; at Anchorage (~61°N) it is over 50% too narrow, so a "5 mile" grid
 * would silently sample a 2.4 mile span and every ranking would be drawn from
 * far closer to the business than the report claims.
 */
export function metersPerDegreeLng(latitude: number): number {
    return METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
}

export function buildGrid(spec: GridSpec): GridPoint[] {
    if (spec.size % 2 === 0) {
        throw new Error(`grid size must be odd, got ${spec.size}`);
    }
    if (spec.spacingMeters <= 0) {
        throw new Error(`grid spacing must be positive, got ${spec.spacingMeters}`);
    }
    if (Math.abs(spec.centerLat) > MAX_ABS_LAT) {
        // Near the poles the longitude step explodes towards infinity and the
        // grid stops describing a usable area. Refusing is better than emitting
        // coordinates nobody should search.
        throw new Error(`grid centre latitude ${spec.centerLat} is outside +/-${MAX_ABS_LAT}`);
    }

    const half = (spec.size - 1) / 2;
    const latStep = spec.spacingMeters / METERS_PER_DEGREE_LAT;
    const points: GridPoint[] = [];

    for (let row = 0; row < spec.size; row += 1) {
        // Row 0 is north, so latitude DECREASES as row increases. Getting this
        // backwards flips the rendered heatmap vertically, which looks
        // plausible and is wrong.
        const lat = spec.centerLat + (half - row) * latStep;

        // Recomputed per row: the east-west span of a row depends on that row's
        // own latitude, not the centre's. Using the centre's for every row skews
        // a tall grid into a trapezoid.
        const lngStep = spec.spacingMeters / metersPerDegreeLng(lat);

        for (let col = 0; col < spec.size; col += 1) {
            points.push({
                row,
                col,
                lat: round6(lat),
                lng: round6(spec.centerLng + (col - half) * lngStep),
                isCenter: row === half && col === half,
            });
        }
    }

    return points;
}

/** ~11cm precision. Enough for a search location, and keeps rows comparable. */
function round6(value: number): number {
    return Math.round(value * 1e6) / 1e6;
}

/**
 * Average rank across the grid — the "ATRP" a customer sees.
 *
 * Cells where the business did NOT appear are excluded, not scored. A sentinel
 * (0, or 20, or "worst rank + 1") would average into the number and make a
 * business that appears in two cells out of forty-nine look mediocre rather
 * than nearly invisible. `coverage` is what carries that, and both must be read
 * together — which is why this returns them together rather than as separate
 * calls someone can use one of.
 */
export function gridCoverage(ranks: readonly (number | null)[]): {
    averageRank: number | null;
    foundCells: number;
    totalCells: number;
    coveragePercent: number;
} {
    const found = ranks.filter((r): r is number => r !== null && r >= 1);
    const total = ranks.length;

    return {
        averageRank:
            found.length === 0
                ? null
                : Math.round((found.reduce((sum, r) => sum + r, 0) / found.length) * 100) / 100,
        foundCells: found.length,
        totalCells: total,
        coveragePercent: total === 0 ? 0 : Math.round((found.length / total) * 1000) / 10,
    };
}
