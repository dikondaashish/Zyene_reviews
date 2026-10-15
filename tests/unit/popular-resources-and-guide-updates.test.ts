import { describe, it, expect } from "vitest";
import { POPULAR_RESOURCES } from "@/components/marketing/popular-resources-block";
import { RESOURCE_MAP } from "@/lib/content/resource-data";
import { BLOG_POST_MAP } from "@/lib/content/blog-data";
import { SIGNUP_URL } from "@/config/env";
import { renderInlineContent } from "@/components/marketing/render-inline-content";

describe("Popular resources block additions", () => {
    it("contains the three new resource and blog links in POPULAR_RESOURCES", () => {
        const hrefs = POPULAR_RESOURCES.map((r) => r.href);
        expect(hrefs).toContain("/resources/google-reviews-guide");
        expect(hrefs).toContain("/blog/how-to-handle-fake-google-reviews");
        expect(hrefs).toContain("/blog/dental-practice-reputation-management-2026");

        const googleReviewsGuide = POPULAR_RESOURCES.find((r) => r.href === "/resources/google-reviews-guide");
        expect(googleReviewsGuide?.title).toBe("Google Reviews: The Complete Local Business Guide");
        expect(googleReviewsGuide?.description).toBeTruthy();

        const fakeReviews = POPULAR_RESOURCES.find((r) => r.href === "/blog/how-to-handle-fake-google-reviews");
        expect(fakeReviews?.title).toBe("How to Handle Fake Google Reviews");
        expect(fakeReviews?.description).toBeTruthy();

        const dental = POPULAR_RESOURCES.find((r) => r.href === "/blog/dental-practice-reputation-management-2026");
        expect(dental?.title).toBe("Dental Practice Reputation Management Guide");
        expect(dental?.description).toBeTruthy();
    });
});

describe("Target guides update requirements", () => {
    it("sets lastUpdated and dateModified to October 2026 on google-reviews-guide", () => {
        const guide = RESOURCE_MAP["google-reviews-guide"];
        expect(guide).toBeDefined();
        expect(guide.lastUpdated).toBe("2026-10-15");
        expect(guide.dateModified).toBe("2026-10-15");

        // Boxed callout below intro
        const freeToolsCallout = guide.body.find(
            (s) => s.text?.includes("/tools/review-link-generator") && s.text?.includes("/tools/reputation-score-checker")
        );
        expect(freeToolsCallout).toBeDefined();

        // Callout near end linking to 7-day free trial with data-track attributes
        const trialCta = guide.body.find(
            (s) => s.type === "cta" && s.ctaHref === SIGNUP_URL && s.ctaTrackLocation === "google-reviews-guide"
        );
        expect(trialCta).toBeDefined();

        // FAQ section exists
        expect(guide.faqs?.length).toBeGreaterThan(0);
    });

    it("sets dateModified to October 2026 on how-to-get-a-google-review-link post", () => {
        const post = BLOG_POST_MAP["how-to-get-a-google-review-link"];
        expect(post).toBeDefined();
        expect(post.dateModified).toBe("2026-10-15");

        // Boxed callout below intro
        const freeToolsCallout = post.body.find(
            (s) => s.text?.includes("/tools/review-link-generator") && s.text?.includes("/tools/reputation-score-checker")
        );
        expect(freeToolsCallout).toBeDefined();

        // Callout near end linking to 7-day free trial with data-track attributes
        const trialCta = post.body.find(
            (s) => s.type === "cta" && s.ctaHref === SIGNUP_URL && s.ctaTrackLocation === "how-to-get-a-google-review-link"
        );
        expect(trialCta).toBeDefined();

        // FAQ section exists
        expect(post.faqs?.length).toBeGreaterThan(0);
    });

    it("parses markdown links cleanly in renderInlineContent", () => {
        const rendered = renderInlineContent("Check our [link](/test) here.");
        expect(Array.isArray(rendered)).toBe(true);
    });
});
