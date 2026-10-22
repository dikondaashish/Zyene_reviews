import { describe, expect, it } from "vitest";
import { readRecommendationImpact } from "@/app/(dashboard)/google-seo-aeo/phase-2/recommendation-impact-view";
import { formatVital, rateVital } from "@/app/(dashboard)/google-seo-aeo/phase-2/web-vitals-view";

describe("recommendation impact", () => {
    it("reads the stored delta into percentage points and citations", () => {
        expect(readRecommendationImpact({ successfulSamples: 24, visibilityDelta: 0.083, citationDelta: 2, measuredAt: "x" })).toEqual({
            kind: "measured",
            visibilityPts: 8,
            citationDelta: 2,
            samples: 24,
        });
    });

    it("waits for data instead of printing raw JSON", () => {
        expect(readRecommendationImpact(null)).toEqual({ kind: "pending" });
        expect(readRecommendationImpact({})).toEqual({ kind: "pending" });
        expect(readRecommendationImpact({ successfulSamples: 0, visibilityDelta: 0.1 })).toEqual({ kind: "pending" });
        expect(readRecommendationImpact({ successfulSamples: 5, visibilityDelta: null })).toMatchObject({ visibilityPts: null, citationDelta: 0 });
    });
});

describe("web vitals", () => {
    it("uses Google's good / needs-work / poor thresholds", () => {
        expect(rateVital("lcp", 2500)).toBe("good");
        expect(rateVital("lcp", 3100)).toBe("needs-work");
        expect(rateVital("lcp", 4200)).toBe("poor");
        expect(rateVital("cls", 0.05)).toBe("good");
        expect(rateVital("cls", 0.3)).toBe("poor");
        expect(rateVital("inp", 250)).toBe("needs-work");
        expect(rateVital("inp", null)).toBe("unknown");
    });

    it("formats the figure shown on hover", () => {
        expect(formatVital("lcp", 3100)).toBe("3.1 s");
        expect(formatVital("inp", 180)).toBe("180 ms");
        expect(formatVital("cls", 0.123)).toBe("0.12");
        expect(formatVital("lcp", null)).toBe("not measured");
    });
});
