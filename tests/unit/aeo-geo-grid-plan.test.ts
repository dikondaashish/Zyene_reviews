import { describe, expect, it } from "vitest";

import {
    estimateGeoGridCostMicroUsd,
    maxGeoGridSizeForPlan,
    spacingMilesToMeters,
} from "../../src/services/aeo/geo-grid/geo-grid-plan";

describe("geo-grid plan controls", () => {
    it.each([[5, 50_000], [7, 98_000], [9, 162_000]] as const)(
        "prices a %ix%i grid from the verified per-request rate",
        (size, expected) => expect(estimateGeoGridCostMicroUsd(size)).toBe(expected)
    );

    it.each([
        ["starter_monthly", "active", 5],
        ["professional_monthly", "active", 7],
        ["enterprise", "trialing", 9],
        ["free", "active", 0],
    ] as const)("caps %s/%s at %i", (plan, status, expected) => {
        expect(maxGeoGridSizeForPlan(plan, status)).toBe(expected);
    });

    it("uses stable meter values for the three supported mile spacings", () => {
        expect(([0.5, 1, 2] as const).map(spacingMilesToMeters)).toEqual([805, 1_609, 3_219]);
    });
});
