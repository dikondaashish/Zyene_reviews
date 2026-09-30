import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rollups: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/reviews/visible-review-rollups", () => ({ fetchVisibleReviewRollupsByBusinessIds: mocks.rollups }));
import { loadWidgetPageData } from "@/app/w/[slug]/load-widget-page-data";

function database(status = "active") {
    const filters: Record<string, unknown> = {};
    const from = vi.fn((table: string) => {
        let columns = "";
        const query = {
            select: (value: string) => { columns = value; return query; },
            eq: (key: string, value: unknown) => { filters[`${table}.${key}`] = value; return query; },
            gte: () => query, order: () => query,
            maybeSingle: async () => ({ data: { id: "business-a", name: "Example", status,
                organization: { plan: "starter", plan_status: "active" } }, error: null }),
            limit: async () => columns.includes("review_platforms")
                ? { data: null, error: { code: "PGRST201" } }
                : { data: [{ id: "review-a", rating: 5, text: "Great service", platform: "google" }], error: null },
        };
        return query;
    });
    mocks.admin.mockReturnValue({ from });
    return { from, filters };
}
beforeEach(() => {
    vi.clearAllMocks();
    mocks.rollups.mockResolvedValue(new Map([["business-a", { totalVisible: 10, averageRatingVisible: 4.7 }]]));
});
describe("public widget data", () => {
    it("loads visible tenant reviews without ambiguous platform relationships", async () => {
        const { filters } = database();
        const data = await loadWidgetPageData("example", "carousel");
        expect(data).toMatchObject({ kind: "ok", reviewCount: 10,
            formattedReviews: [{ id: "review-a", platform: "google", content: "Great service" }] });
        expect(filters).toMatchObject({ "reviews.business_id": "business-a", "reviews.is_visible": true });
    });
    it("does not publish archived businesses or query their reviews", async () => {
        const { from } = database("archived");
        expect(await loadWidgetPageData("example", "badge")).toEqual({ kind: "not-found" });
        expect(from).not.toHaveBeenCalledWith("reviews");
    });
});
