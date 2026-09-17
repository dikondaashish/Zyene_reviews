import { describe, expect, it } from "vitest";
import { AGENCY_PRICING_TIERS, WHITE_LABEL_FEATURES } from "../../src/lib/enterprise/agency-pricing-data";

describe("agency pricing", () => {
    it("defines three agency tiers", () => {
        expect(AGENCY_PRICING_TIERS).toHaveLength(3);
        expect(AGENCY_PRICING_TIERS.map((t) => t.id)).toEqual([
            "agency_partner",
            "agency_growth",
            "agency_scale",
        ]);
    });

    it("describes branding in customer-facing terms", () => {
        const hide = WHITE_LABEL_FEATURES.find((f) => f.title.includes("Hide"));
        expect(hide?.description).toMatch(/Enterprise.*hide Zyene branding/);
        expect(hide?.description).not.toContain("hide_branding");
    });
});
