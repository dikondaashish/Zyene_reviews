import { describe, expect, it } from "vitest";

import {
    googleMapsSearchUrl,
    resolveReviewPageGoogle,
} from "@/app/r/[slug]/resolve-review-page-google";

describe("resolveReviewPageGoogle", () => {
    it("treats a manual google_review_url as connected even without OAuth", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: "https://g.page/r/subzero/review",
                platform: null,
            })
        ).toEqual({
            connected: true,
            googleUrl: "https://g.page/r/subzero/review",
        });
    });

    it("uses the OAuth platform URL when no manual override is set", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: null,
                platform: { external_url: "https://search.google.com/local/writereview?placeid=abc" },
            })
        ).toEqual({
            connected: true,
            googleUrl: "https://search.google.com/local/writereview?placeid=abc",
        });
    });

    it("prefers the manual URL over the platform URL", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: "https://g.page/r/custom",
                platform: { external_url: "https://search.google.com/local/writereview?placeid=abc" },
            }).googleUrl
        ).toBe("https://g.page/r/custom");
    });

    it("treats an OAuth row with no URL as connected so the flow still loads", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: " ",
                platform: { external_url: null },
            })
        ).toEqual({ connected: true, googleUrl: undefined });
    });

    it("falls back to a Maps search URL when the owner never saved a Google link", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: null,
                platform: null,
                mapsFallbackUrl: "https://www.google.com/maps/search/?api=1&query=Subzero",
            })
        ).toEqual({
            connected: true,
            googleUrl: "https://www.google.com/maps/search/?api=1&query=Subzero",
        });
    });

    it("is not connected when neither a URL nor a Google platform row exists", () => {
        expect(
            resolveReviewPageGoogle({
                googleReviewUrl: null,
                platform: null,
            })
        ).toEqual({ connected: false, googleUrl: undefined });
    });
});

describe("googleMapsSearchUrl", () => {
    it("builds a Maps search from name and address", () => {
        expect(googleMapsSearchUrl("Subzero", ["44 Front St", "Worcester", "MA"])).toBe(
            "https://www.google.com/maps/search/?api=1&query=Subzero%2044%20Front%20St%2C%20Worcester%2C%20MA"
        );
    });
});
