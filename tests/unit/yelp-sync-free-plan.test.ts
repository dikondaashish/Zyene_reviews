import { beforeEach, describe, expect, it, vi } from "vitest";
import { YelpApiError } from "@/services/yelp/client";

const mocks = vi.hoisted(() => ({
    getBusiness: vi.fn(),
    getReviews: vi.fn(),
    platformUpdate: vi.fn(),
    reviewUpsert: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/domains/ai/services/ai-analysis-service", () => ({ analyzeReview: vi.fn() }));
vi.mock("@/lib/notifications/review-alert", () => ({ sendReviewAlert: vi.fn() }));
vi.mock("@/services/yelp/adapter", () => ({ getBusiness: mocks.getBusiness, getReviews: mocks.getReviews }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        from: (table: string) => {
            if (table === "reviews") {
                return {
                    upsert: (row: unknown) => {
                        mocks.reviewUpsert(row);
                        return { select: () => ({ single: async () => ({ data: { sentiment: "positive" }, error: null }) }) };
                    },
                };
            }
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({
                            data: { id: "p1", business_id: "b1", external_id: "vindu", sync_state: { other: 1 } },
                            error: null,
                        }),
                    }),
                }),
                update: (patch: unknown) => {
                    mocks.platformUpdate(patch);
                    return { eq: async () => ({ error: null }) };
                },
            };
        },
    }),
}));

import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";

describe("syncYelpReviewsForPlatform", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getBusiness.mockResolvedValue({ reviewCount: 8, rating: 4.9 });
    });

    it("keeps the listing active and syncs rating/count when the plan has no reviews endpoint", async () => {
        mocks.getReviews.mockRejectedValue(new YelpApiError(404, "Not Found"));

        const result = await syncYelpReviewsForPlatform("p1");

        expect(result).toMatchObject({ success: true, total: 0, reviewsUnavailable: true });
        expect(mocks.reviewUpsert).not.toHaveBeenCalled();
        expect(mocks.platformUpdate).toHaveBeenCalledWith(expect.objectContaining({
            sync_status: "active",
            total_reviews: 8,
            average_rating: 4.9,
            sync_state: { other: 1, yelp_reviews_unavailable: true },
        }));
    });

    it("imports reviews and clears the flag when the plan includes them", async () => {
        mocks.getReviews.mockResolvedValue([{
            externalId: "r1", externalUrl: "https://yelp.com/r1", authorName: "Sam", authorAvatarUrl: null,
            rating: 5, content: "Great", publishedAt: "2026-10-01T00:00:00.000Z",
        }]);

        const result = await syncYelpReviewsForPlatform("p1");

        expect(result).toMatchObject({ total: 1, reviewsUnavailable: false });
        expect(mocks.reviewUpsert).toHaveBeenCalledTimes(1);
        expect(mocks.platformUpdate).toHaveBeenCalledWith(expect.objectContaining({
            sync_state: { other: 1, yelp_reviews_unavailable: false },
        }));
    });

    it("still marks the platform errored for real Yelp failures", async () => {
        mocks.getReviews.mockRejectedValue(new YelpApiError(500, "Server Error"));

        await expect(syncYelpReviewsForPlatform("p1")).rejects.toThrow("Yelp API error: 500");
        expect(mocks.platformUpdate).toHaveBeenCalledWith(expect.objectContaining({ sync_status: "error_api_call" }));
    });
});
