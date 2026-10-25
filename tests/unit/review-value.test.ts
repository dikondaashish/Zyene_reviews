import { describe, expect, it } from "vitest";
import {
    FALLBACK_AVERAGE_SALE_USD,
    calculateReviewValue,
    resolveAverageSale,
} from "@/lib/dashboard/review-value";
import { businessPatchSchema } from "@/services/businesses/business-patch-schema";

describe("resolveAverageSale", () => {
    it("prefers the owner's own number", () => {
        expect(resolveAverageSale(12_500, "restaurant")).toEqual({ usd: 125, source: "owner" });
    });

    it("falls back to the category, then to a general default", () => {
        expect(resolveAverageSale(null, "Dental")).toEqual({ usd: 250, source: "category" });
        expect(resolveAverageSale(null, "other")).toEqual({ usd: FALLBACK_AVERAGE_SALE_USD, source: "category" });
        expect(resolveAverageSale(0, undefined).source).toBe("category");
    });
});

describe("calculateReviewValue", () => {
    it("counts each new review as one customer at the average sale, against the plan price", () => {
        // Ninja 360, October: 16 new reviews at $75, on a $29.99 plan.
        const value = calculateReviewValue(16, { usd: 75, source: "category" }, 29.99);
        expect(value.valueUsd).toBe(1200);
        expect(value.perReviewUsd).toBe(75);
        expect(value.returnMultiple).toBeCloseTo(40.01, 1);
    });

    it("has no return multiple without a paid price or without reviews", () => {
        expect(calculateReviewValue(5, { usd: 50, source: "owner" }, 0).returnMultiple).toBeNull();
        expect(calculateReviewValue(5, { usd: 50, source: "owner" }, null).returnMultiple).toBeNull();
        expect(calculateReviewValue(0, { usd: 50, source: "owner" }, 29.99)).toMatchObject({ valueUsd: 0, returnMultiple: null });
    });
});

describe("business PATCH accepts the average sale", () => {
    it("takes whole cents, allows clearing, and rejects zero or fractions", () => {
        expect(businessPatchSchema.safeParse({ average_sale_cents: 7500 }).success).toBe(true);
        expect(businessPatchSchema.safeParse({ average_sale_cents: null }).success).toBe(true);
        expect(businessPatchSchema.safeParse({ average_sale_cents: 0 }).success).toBe(false);
        expect(businessPatchSchema.safeParse({ average_sale_cents: 12.5 }).success).toBe(false);
    });
});
