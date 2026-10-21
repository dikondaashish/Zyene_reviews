import { beforeEach, describe, expect, it, vi } from "vitest";

const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

const mocks = vi.hoisted(() => ({
    canManage: vi.fn(),
    adminUpsert: vi.fn(),
    userUpsert: vi.fn(),
    sync: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/logger", () => ({
    createRequestLogger: () => ({ logger: { info: vi.fn(), error: vi.fn() }, requestId: "req-1" }),
}));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/services/yelp/adapter", () => ({
    getBusiness: async () => ({ yelpUrl: "https://yelp.com/biz/x", reviewCount: 8, rating: 4.9, name: "Vindu" }),
}));
vi.mock("@/services/yelp/sync-service", () => ({ syncYelpReviewsForPlatform: mocks.sync }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
        from: () => ({ upsert: mocks.userUpsert }),
    }),
}));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        from: () => ({
            upsert: (...args: unknown[]) => {
                mocks.adminUpsert(...args);
                return { select: () => ({ single: async () => ({ data: { id: "platform-1" }, error: null }) }) };
            },
        }),
    }),
}));

import { handleYelpConfirm } from "@/services/yelp/confirm-api";

function confirmRequest() {
    return new Request("https://app.example.com/api/integrations/yelp/confirm", {
        method: "POST",
        body: JSON.stringify({ yelpBusinessId: "vindu-indian-restaurant-cumberland", businessId: BUSINESS_ID }),
    });
}

describe("Yelp confirm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sync.mockResolvedValue({ total: 3 });
    });

    it("writes the platform row with the service-role client for a manager", async () => {
        mocks.canManage.mockResolvedValue(true);
        const response = await handleYelpConfirm(confirmRequest());
        expect(response.status).toBe(200);
        expect(mocks.adminUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ business_id: BUSINESS_ID, platform: "yelp", sync_status: "active" }),
            { onConflict: "business_id, platform" },
        );
        expect(mocks.userUpsert).not.toHaveBeenCalled();
        expect(mocks.sync).toHaveBeenCalledWith("platform-1");
    });

    it("refuses non-managers before any write", async () => {
        mocks.canManage.mockResolvedValue(false);
        const response = await handleYelpConfirm(confirmRequest());
        expect(response.status).toBe(403);
        expect(mocks.adminUpsert).not.toHaveBeenCalled();
    });
});
