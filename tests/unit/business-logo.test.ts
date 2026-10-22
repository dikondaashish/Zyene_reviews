import { describe, expect, it } from "vitest";
import { businessInitials, businessLogoDomain, businessLogoUrl } from "@/lib/competitors/business-logo";

describe("businessLogoDomain", () => {
    it("uses the business's own site, without www, path or query", () => {
        expect(businessLogoDomain("https://www.joespizza.com/menu?utm=gbp")).toBe("joespizza.com");
        expect(businessLogoDomain("joespizza.co.uk")).toBe("joespizza.co.uk");
    });

    it("skips shared platforms whose favicon is someone else's brand", () => {
        expect(businessLogoDomain("https://www.facebook.com/joespizza")).toBeNull();
        expect(businessLogoDomain("https://joes-pizza.business.site/")).toBeNull();
        expect(businessLogoDomain("https://joe.wixsite.com/pizza")).toBeNull();
        expect(businessLogoDomain("https://m.yelp.com/biz/joes")).toBeNull();
    });

    it("returns null for missing or unreadable websites", () => {
        expect(businessLogoDomain(null)).toBeNull();
        expect(businessLogoDomain("")).toBeNull();
        expect(businessLogoDomain("not a url")).toBeNull();
        expect(businessLogoDomain("localhost")).toBeNull();
    });
});

describe("businessLogoUrl", () => {
    it("asks Google's favicon service for the largest size", () => {
        expect(businessLogoUrl("https://joespizza.com")).toBe(
            "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://joespizza.com&size=256",
        );
        expect(businessLogoUrl("https://instagram.com/joes")).toBeNull();
    });
});

describe("businessInitials", () => {
    it("takes the first letters of the first two words", () => {
        expect(businessInitials("Joe's Pizza & Grill")).toBe("JP");
        expect(businessInitials("Starbucks")).toBe("ST");
        expect(businessInitials("  ")).toBe("?");
    });
});
