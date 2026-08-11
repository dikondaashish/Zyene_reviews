import { describe, expect, it } from "vitest";
import { mapPromptToPage, type CrawledPageSummary } from "../../src/services/aeo/content-briefs/prompt-page-mapping";

describe("mapPromptToPage", () => {
    it("returns no_pages_crawled when there is nothing to match against", () => {
        expect(mapPromptToPage("best bbq in kansas city", [])).toEqual({
            hasOwner: false,
            reason: "no_pages_crawled",
        });
    });

    it("picks the page whose title strongly overlaps the prompt", () => {
        const pages: CrawledPageSummary[] = [
            { url: "https://x.com/drink-menu", title: "Drink Menu", contentExcerpt: "cocktails wine beer" },
            { url: "https://x.com/food-menu", title: "BBQ Food Menu", contentExcerpt: "brisket ribs burnt ends kansas city" },
        ];
        const result = mapPromptToPage("best bbq in kansas city", pages);
        expect(result).toEqual({ hasOwner: true, url: "https://x.com/food-menu", score: expect.any(Number) });
    });

    it("does not force-fit an unrelated page below the threshold", () => {
        const pages: CrawledPageSummary[] = [
            { url: "https://x.com/reservations", title: "Reservations", contentExcerpt: "book a table online" },
        ];
        const result = mapPromptToPage("do you offer gluten free vegan options", pages);
        expect(result.hasOwner).toBe(false);
        if (result.hasOwner) throw new Error("unreachable");
        expect(result.reason).toBe("no_page_scores_above_threshold");
    });

    it("weights a title match higher than the same term only in body text", () => {
        const titleMatch: CrawledPageSummary = { url: "https://x.com/a", title: "Catering Services", contentExcerpt: "" };
        const bodyOnlyMatch: CrawledPageSummary = { url: "https://x.com/b", title: "About Us", contentExcerpt: "we also do catering for events" };
        const result = mapPromptToPage("catering", [bodyOnlyMatch, titleMatch]);
        expect(result).toMatchObject({ hasOwner: true, url: "https://x.com/a" });
    });

    it("never throws on empty or stopword-only prompt text", () => {
        const pages: CrawledPageSummary[] = [{ url: "https://x.com/a", title: "Home", contentExcerpt: "welcome" }];
        expect(() => mapPromptToPage("", pages)).not.toThrow();
        expect(() => mapPromptToPage("the a an", pages)).not.toThrow();
        expect(mapPromptToPage("", pages).hasOwner).toBe(false);
    });
});
