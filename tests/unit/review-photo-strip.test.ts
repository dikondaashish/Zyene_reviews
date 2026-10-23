import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { REVIEW_PHOTO_STRIP_MAX, reviewPhotoUrls } from "@/components/reviews/review-photo-strip";

vi.mock("@/components/reviews/review-card", () => ({ ReviewCard: () => createElement("div", null, "full review") }));
const { CompactReviewRow } = await import("@/components/reviews/compact-review-row");

const photos = (n: number) => Array.from({ length: n }, (_, i) => `https://lh3.googleusercontent.com/p${i}`);
const row = (review_photo_urls: unknown, open = false) =>
    renderToStaticMarkup(createElement(CompactReviewRow, {
        review: { id: "r1", author_name: "Sam", rating: 5, platform: "google", text: "Great ribs", response_status: "pending", review_photo_urls } as never,
        googleMapsListingUrl: null, planAllowsAiReplies: true, isSelected: false, onSelect: () => {},
        open, onOpenChange: () => {},
    }));
const thumbs = (html: string) => html.match(/<img src="https:\/\/lh3[^"]*"/g) ?? [];

describe("reviewPhotoUrls", () => {
    it("keeps only real URLs", () => {
        expect(reviewPhotoUrls(["a", "", "  ", null, 3, "b"])).toEqual(["a", "b"]);
        expect(reviewPhotoUrls(null)).toEqual([]);
        expect(reviewPhotoUrls("a")).toEqual([]);
    });
});

describe("review photos in the list", () => {
    it("shows the customer's photos right in the closed row", () => {
        const html = row(photos(3));
        expect(thumbs(html)).toHaveLength(3);
        expect(html).toContain('aria-label="3 photos from Sam"');
        expect(html).toContain("Open photo 1 of 3");
        expect(html).not.toMatch(/\d photos<\/span>/);
    });

    it(`shows at most ${REVIEW_PHOTO_STRIP_MAX} and counts the rest on the last one`, () => {
        const html = row(photos(9));
        expect(thumbs(html)).toHaveLength(REVIEW_PHOTO_STRIP_MAX);
        expect(html).toContain(">+3</span>");
        expect(html).toContain("Open photo 6, 3 more");
    });

    it("puts photos outside the open/close button so each one can be clicked", () => {
        const html = row(photos(2));
        const toggle = html.slice(html.indexOf("aria-expanded"), html.indexOf("</button>"));
        expect(toggle).not.toContain("lh3.googleusercontent.com");
        expect(html.indexOf("Great ribs")).toBeLessThan(html.indexOf("Open photo 1"));
        expect(html.indexOf("Open photo 1")).toBeLessThan(html.indexOf("Read &amp; reply"));
    });

    it("leaves the strip to the full review once the row is open", () => {
        expect(row(photos(2), true)).not.toContain('aria-label="2 photos from Sam"');
    });

    it("shows nothing for reviews without photos", () => {
        for (const value of [null, [], [""]]) expect(row(value)).not.toContain("photos from");
    });

    it("keeps a single keyboard stop for opening the review", () => {
        const html = row(photos(1));
        expect(html.match(/aria-expanded=/g)).toHaveLength(1);
        expect(html).toMatch(/tabindex="-1"[^>]*>.*Read &amp; reply/);
    });
});
