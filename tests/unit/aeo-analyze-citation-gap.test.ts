import { describe, expect, it } from "vitest";
import { analyzeCitationGap, type OwnPageStructure } from "../../src/services/aeo/content-briefs/analyze-citation-gap";
import type { CitedSourceStructure } from "../../src/services/aeo/content-briefs/fetch-cited-source";

function source(overrides: Partial<CitedSourceStructure>): { ok: true; structure: CitedSourceStructure } {
    return {
        ok: true,
        structure: {
            url: "https://competitor.com/a",
            ok: true,
            title: "x",
            wordCount: 500,
            hasQuestionHeadings: false,
            hasDirectAnswer: false,
            hasFaqSchema: false,
            contentExcerpt: "x",
            ...overrides,
        },
    };
}

const FULL_OWN_PAGE: OwnPageStructure = {
    hasFaqSchema: true,
    hasQuestionHeadings: true,
    hasDirectAnswer: true,
    hasLocalBusinessSchema: true,
};

describe("analyzeCitationGap", () => {
    it("no gaps when our page already matches everything the cited sources have", () => {
        const gap = analyzeCitationGap(FULL_OWN_PAGE, [source({ hasFaqSchema: true })]);
        expect(gap.missingFaqSchema).toBe(false);
    });

    it("flags a missing FAQ schema only when a cited source actually has one", () => {
        const noFaqSources = analyzeCitationGap(null, [source({ hasFaqSchema: false })]);
        expect(noFaqSources.missingFaqSchema).toBe(false); // nobody has it — not a gap, not a claim we can support

        const withFaqSource = analyzeCitationGap(null, [source({ hasFaqSchema: true })]);
        expect(withFaqSource.missingFaqSchema).toBe(true);
    });

    it("a null own page (no owning page exists) is treated as missing everything", () => {
        const gap = analyzeCitationGap(null, [
            source({ hasFaqSchema: true, hasQuestionHeadings: true, hasDirectAnswer: true }),
        ]);
        expect(gap.missingFaqSchema).toBe(true);
        expect(gap.missingQuestionHeadings).toBe(true);
        expect(gap.missingDirectAnswer).toBe(true);
        expect(gap.missingLocalBusinessSchema).toBe(true);
    });

    it("flags allSourcesUnreachable only when there WERE sources and all failed", () => {
        const allFailed = analyzeCitationGap(FULL_OWN_PAGE, [{ ok: false }, { ok: false }]);
        expect(allFailed.allSourcesUnreachable).toBe(true);

        const noneCited = analyzeCitationGap(FULL_OWN_PAGE, []);
        expect(noneCited.allSourcesUnreachable).toBe(false);

        const someReachable = analyzeCitationGap(FULL_OWN_PAGE, [{ ok: false }, source({})]);
        expect(someReachable.allSourcesUnreachable).toBe(false);
    });

    it("missingLocalBusinessSchema is independent of citation reachability — it's about OUR page, not theirs", () => {
        const gap = analyzeCitationGap(null, []);
        expect(gap.missingLocalBusinessSchema).toBe(true);
    });
});
