import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
    return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Phase 0 collateral integrity", () => {
    it("does not sell the legacy AI visibility heuristic as a product capability", () => {
        const foundation = source("src/lib/growth/product-foundation.ts");

        expect(foundation).not.toContain("AI visibility (beta)");
        expect(foundation).not.toContain('capability: "AI visibility audit"');
        expect(foundation).not.toContain("Rank higher in Maps and AI search");
    });

    it("does not present undisclosed Google weighting as measured fact", () => {
        const content = [
            source("src/lib/content/blog-posts-month1.ts"),
            source("src/lib/content/blog-posts-month2.ts"),
            source("src/lib/content/resource-data.ts"),
        ].join("\n");

        const unsupportedClaims = [
            "Google Reviews Now Power AI Overviews",
            "among the most heavily weighted inputs",
            "significantly more likely to appear in AI Overview",
            "Google weights the last ninety days heavily",
            "Reviews from the last 90 days are weighted more heavily",
            "Google has confirmed that businesses that respond to reviews rank higher",
            "Google has confirmed that responding to reviews is a signal",
        ];

        for (const claim of unsupportedClaims) expect(content).not.toContain(claim);
    });

    it("keeps the measurement limits explicit", () => {
        const monthOne = source("src/lib/content/blog-posts-month1.ts");
        const monthTwo = source("src/lib/content/blog-posts-month2.ts");

        expect(monthOne).toContain("no review-specific weighting for AI Overviews");
        expect(monthOne).toContain("publishes no fifty-review threshold");
        expect(monthTwo).toContain("publishes no ninety-day review-weighting rule");
    });

    it("does not present illustrative industry workflows as customer proof", () => {
        const industries = source("src/lib/industries/industry-data.ts");
        const section = source(
            "src/app/(marketing)/industries/[industry]/industries-industry-use-case-section.tsx",
        );

        expect(industries).not.toContain("useCaseQuote");
        expect(industries).not.toContain("resultAfter");
        expect(industries).not.toContain("ownerName");
        expect(section).toContain("This is not a customer testimonial or a promised result.");
    });
});
