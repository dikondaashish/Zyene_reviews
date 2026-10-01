import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: vi.fn() }));
import { googleReviewPhotoUrls } from "@/services/google/sync-service/helpers";
import { computeReviewHash } from "@/utils/review-hash";
import type { GoogleReview } from "@/services/google/business-profile";
const base: GoogleReview = {
    reviewId: "review-1", reviewer: { displayName: "Reviewer" }, starRating: "FIVE",
    createTime: "2026-09-30T12:00:00Z", updateTime: "2026-09-30T12:00:00Z",
};
const withMedia = { ...base, reviewMediaItems: [
    { thumbnailUrl: "https://lh3.googleusercontent.com/photo", thumbnailLabel: "Food" },
    { thumbnailUrl: "https://lh3.googleusercontent.com/video", videoUrl: "https://example.com/video" },
] };
describe("Google review media import", () => {
    it("imports Google's review photos without treating video thumbnails as photos", () => {
        expect(googleReviewPhotoUrls(withMedia)).toEqual(["https://lh3.googleusercontent.com/photo"]);
    });
    it("deduplicates official and legacy photos and rejects unsafe URLs", () => {
        expect(googleReviewPhotoUrls({ ...withMedia, photos: [{ url: "javascript:alert(1)" }],
            photoUrls: [" https://lh3.googleusercontent.com/photo ", "https://example.com/extra", ""] }))
            .toEqual(["https://lh3.googleusercontent.com/photo", "https://example.com/extra"]);
    });
    it("returns null when a review has no photos", () => {
        expect(googleReviewPhotoUrls(base)).toBeNull();
    });
    it("detects added and removed photos even when review text is unchanged", () => {
        expect(computeReviewHash(withMedia)).not.toBe(computeReviewHash(base));
    });
});
