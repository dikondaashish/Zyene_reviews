import { describe, expect, it } from "vitest";
import { FEATURED_TESTIMONIALS } from "@/lib/social-proof/social-proof-data";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

describe("featured workflow cards", () => {
    it("link only to existing case studies", () => {
        for (const card of FEATURED_TESTIMONIALS) {
            expect(CASE_STUDY_MAP[card.caseStudySlug], card.caseStudySlug).toBeDefined();
        }
    });

    it("carry no customer quotes, names, or ratings", () => {
        for (const card of FEATURED_TESTIMONIALS) {
            expect(Object.keys(card)).toEqual(["caseStudySlug"]);
        }
    });
});
