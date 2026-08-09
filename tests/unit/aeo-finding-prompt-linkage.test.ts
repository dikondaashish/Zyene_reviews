import { describe, expect, it } from "vitest";
import { classifyFindingImpact, normalizeUrlForMatch } from "../../src/services/aeo/crawler/finding-prompt-linkage";

describe("normalizeUrlForMatch", () => {
    it("lowercases the host and strips www", () => {
        expect(normalizeUrlForMatch("https://WWW.Example.com/Page")).toBe("https://example.com/Page");
    });

    it("strips a trailing slash except on the root", () => {
        expect(normalizeUrlForMatch("https://example.com/page/")).toBe("https://example.com/page");
        expect(normalizeUrlForMatch("https://example.com/")).toBe("https://example.com/");
    });

    it("strips the hash", () => {
        expect(normalizeUrlForMatch("https://example.com/page#section")).toBe("https://example.com/page");
    });

    it("returns the raw string unchanged for an unparseable URL rather than throwing", () => {
        expect(normalizeUrlForMatch("not a url")).toBe("not a url");
    });
});

describe("classifyFindingImpact", () => {
    it("no_demonstrated_impact when the business has zero active prompts", () => {
        const result = classifyFindingImpact(
            { pageUrl: "https://x.com/a" },
            { citations: [], activePromptCount: 0 }
        );
        expect(result.level).toBe("no_demonstrated_impact");
        expect(result.affectedPrompts).toEqual([]);
    });

    it("confirmed when the exact page was actually cited for an active prompt", () => {
        const result = classifyFindingImpact(
            { pageUrl: "https://x.com/menu" },
            {
                citations: [{ normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" }],
                activePromptCount: 3,
            }
        );
        expect(result.level).toBe("confirmed");
        expect(result.affectedPrompts).toEqual([{ promptId: "p1", promptText: "best bbq" }]);
    });

    it("confirmed matches after normalization (trailing slash / host case differences)", () => {
        const result = classifyFindingImpact(
            { pageUrl: "https://WWW.x.com/menu/" },
            {
                citations: [{ normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" }],
                activePromptCount: 1,
            }
        );
        expect(result.level).toBe("confirmed");
    });

    it("dedupes affected prompts when the same page was cited across multiple samples for the same prompt", () => {
        const result = classifyFindingImpact(
            { pageUrl: "https://x.com/menu" },
            {
                citations: [
                    { normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" },
                    { normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" },
                ],
                activePromptCount: 1,
            }
        );
        expect(result.affectedPrompts).toHaveLength(1);
    });

    it("possible for a page-level finding on a page that was never cited", () => {
        const result = classifyFindingImpact(
            { pageUrl: "https://x.com/never-cited" },
            {
                citations: [{ normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" }],
                activePromptCount: 1,
            }
        );
        expect(result.level).toBe("possible");
    });

    it("likely for a site-wide finding when the business has citation history", () => {
        const result = classifyFindingImpact(
            { pageUrl: null },
            {
                citations: [{ normalizedUrl: "https://x.com/menu", promptId: "p1", promptText: "best bbq" }],
                activePromptCount: 2,
            }
        );
        expect(result.level).toBe("likely");
    });

    it("possible for a site-wide finding with no citation history at all", () => {
        const result = classifyFindingImpact(
            { pageUrl: null },
            { citations: [], activePromptCount: 2 }
        );
        expect(result.level).toBe("possible");
    });
});
