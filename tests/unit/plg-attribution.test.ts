import { describe, expect, it } from "vitest";
import { buildPlgMarketingUrl, plgSmsFooter } from "../../src/lib/growth/plg-attribution";
import { MARKETING_SITE_ORIGIN } from "../../src/lib/seo/marketing-site-url";

describe("PLG attribution", () => {
    it("builds marketing URLs with ref and UTM for each touchpoint", () => {
        const url = buildPlgMarketingUrl("widget");
        const parsed = new URL(url);
        expect(parsed.origin).toBe(MARKETING_SITE_ORIGIN);
        expect(parsed.searchParams.get("ref")).toBe("widget");
        expect(parsed.searchParams.get("utm_source")).toBe("plg");
        expect(parsed.searchParams.get("utm_medium")).toBe("widget");
        expect(parsed.searchParams.get("utm_campaign")).toBe("product_loop");
    });

    it("appends SMS footer with review-request ref", () => {
        const footer = plgSmsFooter();
        expect(footer).toContain("Zyene Reviews");
        expect(footer).toContain("ref=review-request");
    });
});
