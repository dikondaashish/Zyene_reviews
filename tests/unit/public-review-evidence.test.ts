import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ update: vi.fn(), terminate: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({
    from: (table: string) => {
        const chain = {
            select: () => chain, eq: () => chain, gte: () => chain, order: () => chain,
            update: (data: unknown) => { mocks.update(data); return chain; },
            maybeSingle: async () => ({ data: table === "businesses"
                ? { id: "business", name: "Sample business", organization: { plan: "starter", plan_status: "active" } }
                : { id: "6df3e0d4-343c-4aa6-a6c9-306d4523f80a" }, error: null }),
            limit: async () => ({ data: [{ id: "review", rating: 5, text: "  ", author_name: "Reviewer", created_at: "2026-09-01", review_platforms: { platform: "google" } }] }),
            then: (resolve: (v: unknown) => void) => resolve({ error: null }),
        };
        return chain;
    },
}) }));
vi.mock("@/lib/reviews/visible-review-rollups", () => ({ fetchVisibleReviewRollupsByBusinessIds: async () => new Map([["business", { totalVisible: 1, averageRatingVisible: 5 }]]) }));
vi.mock("@/lib/campaigns/terminate-drip", () => ({ terminateReviewRequestDrip: mocks.terminate }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

import {
    loadWidgetPageData,
    sanitizeExternalReviewUrl,
} from "@/app/w/[slug]/load-widget-page-data";
import { POST } from "@/app/api/track/review/route";

beforeEach(() => vi.clearAllMocks());
describe("public review evidence", () => {
    it("preserves rating-only reviews without inventing a quote", async () => {
        const result = await loadWidgetPageData("sample", "carousel");
        expect(result.kind).toBe("ok");
        if (result.kind === "ok") expect(result.formattedReviews[0].content).toBe("");
    });
    it("keeps only safe original-review URLs for the widget", () => {
        expect(sanitizeExternalReviewUrl("https://reviews.example.test/r/1")).toBe(
            "https://reviews.example.test/r/1"
        );
        expect(sanitizeExternalReviewUrl("javascript:alert(1)")).toBeUndefined();
    });
    it("does not accept a client's assertion that a public review was published", async () => {
        const response = await POST(new Request("https://example.test/api/track/review", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", requestId: "6df3e0d4-343c-4aa6-a6c9-306d4523f80a", trackData: { status: "completed", completed_at: "2026-09-10T12:00:00.000Z", review_left: true } }),
        }));
        expect(response.status).toBe(200);
        expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("review_left");
        expect(mocks.terminate).toHaveBeenCalled();
    });
});
