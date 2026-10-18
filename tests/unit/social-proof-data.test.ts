import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlatformStats } from "@/lib/social-proof/social-proof-data";

describe("getPlatformStats", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("returns null instead of illustrative numbers when no aggregates are configured", () => {
        vi.stubEnv("NEXT_PUBLIC_TRUST_REVIEW_COUNT", "");
        vi.stubEnv("NEXT_PUBLIC_TRUST_BUSINESS_COUNT", "");
        vi.stubEnv("NEXT_PUBLIC_TRUST_STAR_RATING", "");
        expect(getPlatformStats()).toBeNull();
    });

    it("formats only the aggregates that are configured", () => {
        vi.stubEnv("NEXT_PUBLIC_TRUST_REVIEW_COUNT", "3,250");
        vi.stubEnv("NEXT_PUBLIC_TRUST_BUSINESS_COUNT", "");
        vi.stubEnv("NEXT_PUBLIC_TRUST_STAR_RATING", "");
        expect(getPlatformStats()).toEqual({
            reviewCountFormatted: "3.2k+",
            businessCountFormatted: null,
            starRating: null,
        });
    });
});
