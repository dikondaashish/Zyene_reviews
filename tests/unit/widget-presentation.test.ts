import { describe, expect, it } from "vitest";
import { parseWidgetConfig } from "@/lib/widgets/config";
import { widgetPresentation } from "@/lib/widgets/presentation";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
const data: PublicWidgetData = {
    businessName: "Example", reviewsUrl: "/w/example", hideBranding: false,
    reviewCount: 40, averageRating: 4.2, googleCount: 30, googleRating: 4.5,
    reviews: [
        { id: "1", author_name: "A", rating: 5, content: "Good", platform: "google", created_at: "2026-09-01" },
        { id: "2", author_name: "B", rating: 4, content: "Useful", platform: "yelp", created_at: "2026-09-02" },
        { id: "3", author_name: "C", rating: 2, content: "Slow", platform: "google", created_at: "2026-09-03" },
        { id: "4", author_name: "D", rating: 5, content: "", platform: "google", created_at: "2026-09-04" },
    ],
};
describe("widget review presentation", () => {
    it("filters cards without changing the genuine overall Google rating", () => {
        const result = widgetPresentation(data, parseWidgetConfig({ textOnly: true }));
        expect(result.reviews.map(r => r.id)).toEqual(["1"]);
        expect(result).toMatchObject({ count: 30, rating: 4.5 });
    });
    it("honors source, exclusions, rating, ordering and limit without mutating data", () => {
        const result = widgetPresentation(data, parseWidgetConfig({ source: "all", minRating: 1, exclude: " slow, A ", sort: "oldest", limit: 1 }));
        expect(result.reviews.map(r => r.id)).toEqual(["2"]);
        expect(result).toMatchObject({ count: 40, rating: 4.2 });
        expect(data.reviews.map(r => r.id)).toEqual(["1", "2", "3", "4"]);
    });
});
