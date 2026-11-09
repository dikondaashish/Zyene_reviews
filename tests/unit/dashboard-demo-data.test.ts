import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyVisibleReviewRollup, type VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";

const mocks = vi.hoisted(() => ({
    business: null as Record<string, unknown> | null,
    rollup: null as VisibleReviewRollup | null,
    rollupCalls: 0,
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    }),
}));
vi.mock("@/lib/auth/business-context", () => ({
    getActiveBusinessId: async () => ({
        business: mocks.business,
        organization: { id: "org-1", plan: "pro", plan_status: "active" },
        businesses: [mocks.business],
    }),
    getGoogleQaUnavailableForActiveBusiness: async () => false,
}));
vi.mock("@/lib/reviews/visible-review-rollups", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/reviews/visible-review-rollups")>();
    return {
        ...actual,
        fetchVisibleReviewRollupsByBusinessIds: async (_s: unknown, ids: string[]) => {
            mocks.rollupCalls += 1;
            return new Map(ids.map((id) => [id, mocks.rollup ?? actual.emptyVisibleReviewRollup()]));
        },
    };
});

import { loadDashboardAuth } from "@/app/(dashboard)/dashboard/load-dashboard-auth";
import { shouldUseDashboardDemoData } from "@/app/(dashboard)/dashboard/dashboard-demo-mode";

function biz(reviewPlatforms: Array<Record<string, unknown>>, totalReviews = 0) {
    return {
        id: "biz-1",
        name: "Cafe",
        slug: "cafe",
        total_reviews: totalReviews,
        average_rating: 0,
        review_platforms: reviewPlatforms,
    };
}

function rollupWithRows(n: number): VisibleReviewRollup {
    return { ...emptyVisibleReviewRollup(), totalReviewRows: n, totalVisible: n };
}

describe("dashboard demo data", () => {
    beforeEach(() => {
        mocks.business = null;
        mocks.rollup = null;
        mocks.rollupCalls = 0;
    });

    it("shows sample data only for a business with no platforms and no reviews", async () => {
        mocks.business = biz([]);
        const auth = await loadDashboardAuth();
        expect(auth.useDemoData).toBe(true);
    });

    it("shows real data when Google needs reconnecting (token revoked)", async () => {
        mocks.business = biz([
            { platform: "google", google_location_id: "loc-1", sync_status: "error_token_revoked" },
        ]);
        mocks.rollup = rollupWithRows(42);
        const auth = await loadDashboardAuth();
        expect(auth.isGoogleConnected).toBe(false);
        expect(auth.useDemoData).toBe(false);
        expect(auth.visibleReviewRollup?.totalReviewRows).toBe(42);
    });

    it("shows real data for a Yelp-only or Facebook-only business", async () => {
        for (const platform of ["yelp", "facebook"]) {
            mocks.business = biz([{ platform, sync_status: "active" }]);
            const auth = await loadDashboardAuth();
            expect(auth.useDemoData).toBe(false);
        }
    });

    it("shows real data when reviews are stored even without a platform row", async () => {
        mocks.business = biz([]);
        mocks.rollup = rollupWithRows(3);
        expect((await loadDashboardAuth()).useDemoData).toBe(false);

        mocks.rollup = null;
        mocks.business = biz([], 7);
        expect((await loadDashboardAuth()).useDemoData).toBe(false);
    });

    it("loads the real review rollup for every business with an id", async () => {
        mocks.business = biz([{ platform: "yelp" }]);
        await loadDashboardAuth();
        expect(mocks.rollupCalls).toBe(1);
    });

    it("helper treats a missing business as demo", () => {
        expect(
            shouldUseDashboardDemoData({
                businessId: "",
                reviewPlatforms: [{ platform: "google" }],
                totalReviews: 0,
                visibleReviewRollup: null,
            }),
        ).toBe(true);
    });
});

describe("loadDashboardStats demo overlay", () => {
    it("keeps the real rollup and rating when useDemoData is false", async () => {
        vi.resetModules();
        vi.doMock("@/lib/db/redis", () => ({ redis: { get: async () => null, set: async () => "OK" } }));
        vi.doMock("@/app/(dashboard)/dashboard/load-dashboard-stats-queries", () => ({
            runDashboardStatsQueries: async () => [],
        }));
        vi.doMock("@/app/(dashboard)/dashboard/load-dashboard-stats-process", () => ({
            processDashboardStatsQueryResults: (_a: unknown, stats: unknown) => ({ stats }),
        }));
        vi.doMock("@/app/(dashboard)/dashboard/load-dashboard-stats-cache-write", () => ({
            cacheDashboardStats: async () => undefined,
        }));
        const { loadDashboardStats } = await import("@/app/(dashboard)/dashboard/load-dashboard-stats");
        const realRollup = rollupWithRows(42);
        const business = { ...biz([{ platform: "google", sync_status: "error_token_revoked" }], 42), average_rating: 3.9 };
        const base = { business, visibleReviewRollup: realRollup } as unknown as Parameters<typeof loadDashboardStats>[0];

        const real = await loadDashboardStats({ ...base, useDemoData: false });
        expect(real.visibleReviewRollup).toBe(realRollup);
        expect(business.total_reviews).toBe(42);
        expect(business.average_rating).toBe(3.9);

        const demo = await loadDashboardStats({ ...base, useDemoData: true });
        expect(demo.visibleReviewRollup).not.toBe(realRollup);
    });
});
