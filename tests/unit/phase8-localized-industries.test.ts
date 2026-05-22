import { describe, expect, it } from "vitest";
import {
    ES_INDUSTRY_LOCALIZED_SLUGS,
    getLocalizedIndustry,
    LOCALIZED_INDUSTRY_PAGES,
} from "../../src/lib/phase8/localized-industries";

describe("localized industry pages", () => {
    it("maps Spanish restaurantes slug to English restaurants", () => {
        const page = getLocalizedIndustry("es", "restaurantes");
        expect(page?.industrySlug).toBe("restaurants");
        expect(page?.locale).toBe("es");
    });

    it("includes all eight Spanish industry slugs", () => {
        expect(ES_INDUSTRY_LOCALIZED_SLUGS.length).toBe(8);
        expect(LOCALIZED_INDUSTRY_PAGES.every((p) => p.locale === "es")).toBe(true);
    });
});
