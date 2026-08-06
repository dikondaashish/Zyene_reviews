import { describe, expect, it } from "vitest";

import {
    buildGrid,
    gridCoverage,
    metersPerDegreeLng,
} from "../../src/services/aeo/geo-grid/grid-geometry";

const AUSTIN = { centerLat: 30.2672, centerLng: -97.7431 };

/** Haversine, in metres — an independent check on the generated coordinates. */
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6_371_000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

describe("grid shape", () => {
    it.each([5, 7, 9] as const)("builds a %ix%i grid with one centre", (size) => {
        const points = buildGrid({ ...AUSTIN, size, spacingMeters: 1000 });
        expect(points).toHaveLength(size * size);
        expect(points.filter((p) => p.isCenter)).toHaveLength(1);
    });

    it("puts the centre cell exactly on the business", () => {
        const points = buildGrid({ ...AUSTIN, size: 5, spacingMeters: 1000 });
        const centre = points.find((p) => p.isCenter)!;
        expect(distanceMeters(centre, { lat: AUSTIN.centerLat, lng: AUSTIN.centerLng })).toBeLessThan(1);
    });

    it("rejects an even size, which would have no single centre", () => {
        expect(() => buildGrid({ ...AUSTIN, size: 4 as unknown as 5, spacingMeters: 1000 })).toThrow(/odd/);
    });

    it("rejects a non-positive spacing", () => {
        expect(() => buildGrid({ ...AUSTIN, size: 5, spacingMeters: 0 })).toThrow(/positive/);
    });

    it("gives every cell a unique row/col address", () => {
        const points = buildGrid({ ...AUSTIN, size: 7, spacingMeters: 800 });
        const keys = new Set(points.map((p) => `${p.row},${p.col}`));
        expect(keys.size).toBe(49);
    });
});

describe("spacing is real distance, not degrees", () => {
    /**
     * The bug this guards: a grid stepped by a fixed number of DEGREES is
     * correct at the equator and progressively squashed east-west with
     * latitude. At Austin a naive grid is already ~13% too narrow, so every
     * ranking would be sampled from closer to the business than the report says.
     */
    it("spaces neighbouring cells at the requested distance, north-south", () => {
        const points = buildGrid({ ...AUSTIN, size: 5, spacingMeters: 1000 });
        const a = points.find((p) => p.row === 2 && p.col === 2)!;
        const b = points.find((p) => p.row === 3 && p.col === 2)!;
        expect(distanceMeters(a, b)).toBeGreaterThan(980);
        expect(distanceMeters(a, b)).toBeLessThan(1020);
    });

    it("spaces neighbouring cells at the requested distance, east-west", () => {
        const points = buildGrid({ ...AUSTIN, size: 5, spacingMeters: 1000 });
        const a = points.find((p) => p.row === 2 && p.col === 2)!;
        const b = points.find((p) => p.row === 2 && p.col === 3)!;
        expect(distanceMeters(a, b)).toBeGreaterThan(980);
        expect(distanceMeters(a, b)).toBeLessThan(1020);
    });

    it("holds east-west spacing at high latitude too", () => {
        // Anchorage: a naive fixed-degree grid is over 50% too narrow here.
        const points = buildGrid({ centerLat: 61.2181, centerLng: -149.9003, size: 5, spacingMeters: 2000 });
        const a = points.find((p) => p.row === 2 && p.col === 2)!;
        const b = points.find((p) => p.row === 2 && p.col === 3)!;
        expect(distanceMeters(a, b)).toBeGreaterThan(1960);
        expect(distanceMeters(a, b)).toBeLessThan(2040);
    });

    it("keeps a tall grid rectangular rather than trapezoidal", () => {
        // Longitude step is recomputed per row; using the centre's for every row
        // would make the top and bottom rows different widths.
        const points = buildGrid({ centerLat: 55, centerLng: 0, size: 9, spacingMeters: 3000 });
        const width = (row: number) => {
            const left = points.find((p) => p.row === row && p.col === 0)!;
            const right = points.find((p) => p.row === row && p.col === 8)!;
            return distanceMeters(left, right);
        };
        expect(Math.abs(width(0) - width(8))).toBeLessThan(50);
        expect(Math.abs(width(0) - width(4))).toBeLessThan(50);
    });

    it("shrinks the metres-per-degree of longitude as latitude rises", () => {
        expect(metersPerDegreeLng(0)).toBeGreaterThan(metersPerDegreeLng(45));
        expect(metersPerDegreeLng(45)).toBeGreaterThan(metersPerDegreeLng(70));
    });

    it("refuses a centre near the poles rather than emitting nonsense", () => {
        expect(() => buildGrid({ centerLat: 89, centerLng: 0, size: 5, spacingMeters: 1000 })).toThrow(/latitude/);
    });
});

describe("orientation", () => {
    it("puts row 0 to the north", () => {
        // Getting this backwards flips the rendered heatmap vertically, which
        // looks entirely plausible and is wrong.
        const points = buildGrid({ ...AUSTIN, size: 5, spacingMeters: 1000 });
        const north = points.find((p) => p.row === 0 && p.col === 2)!;
        const south = points.find((p) => p.row === 4 && p.col === 2)!;
        expect(north.lat).toBeGreaterThan(south.lat);
    });

    it("puts col 0 to the west", () => {
        const points = buildGrid({ ...AUSTIN, size: 5, spacingMeters: 1000 });
        const west = points.find((p) => p.row === 2 && p.col === 0)!;
        const east = points.find((p) => p.row === 2 && p.col === 4)!;
        expect(west.lng).toBeLessThan(east.lng);
    });
});

describe("coverage never invents a rank", () => {
    /**
     * The pre-Phase-1 heatmap derived a rank from the star rating, so every cell
     * always had one. A cell where the business does not appear has NO rank, and
     * scoring it with a sentinel is how "nearly invisible" becomes "mediocre".
     */
    it("excludes not-found cells from the average rather than scoring them", () => {
        const result = gridCoverage([1, 2, null, null, null]);
        expect(result.averageRank).toBe(1.5);
        expect(result.foundCells).toBe(2);
        expect(result.totalCells).toBe(5);
        expect(result.coveragePercent).toBe(40);
    });

    it("returns a null average when the business appears nowhere", () => {
        // Not 0, and not "worst rank": absent is a different statement from bad.
        const result = gridCoverage([null, null, null]);
        expect(result.averageRank).toBeNull();
        expect(result.coveragePercent).toBe(0);
    });

    it("reports a strong average and low coverage separately", () => {
        // Rank 1 in two cells out of forty-nine is not a good result, and only
        // reading them together says so.
        const ranks = [1, 1, ...Array<null>(47).fill(null)];
        const result = gridCoverage(ranks);
        expect(result.averageRank).toBe(1);
        expect(result.coveragePercent).toBe(4.1);
    });

    it("handles an empty grid without dividing by zero", () => {
        expect(gridCoverage([])).toMatchObject({ averageRank: null, coveragePercent: 0 });
    });
});
