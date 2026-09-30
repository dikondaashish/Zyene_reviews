import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/app/api/_shared/errors";

const mocks = vi.hoisted(() => ({ user: vi.fn(), platform: vi.fn(), admin: vi.fn(), send: vi.fn(),
    limit: vi.fn(), reconcile: vi.fn() }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/services/google/sync-google-platform", () => ({ getGooglePlatformForUser: mocks.platform }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/lib/auth/rate-limit", () => ({ syncRateLimit: { limit: mocks.limit } }));
vi.mock("@/services/google/sync-run-state", () => ({ isStaleRunningGoogleSync: () => false,
    reconcileStaleGoogleSyncRun: mocks.reconcile, clearGoogleSyncBootstrapHandoff: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { handleGoogleSyncGet, handleGoogleSyncPost } from "@/services/google/sync-google-api";

const businessId = "9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7";
const platform = { id: "platform-a", sync_status: "idle", total_reviews: 5,
    locked_until: null, sync_state: { private: true } };
const supabase = { from: vi.fn(() => {
    const query = { select: () => query, eq: () => query,
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: 5, error: null }).then(resolve) };
    return query;
}) };
const post = (body = JSON.stringify({ businessId })) => new Request("http://localhost/api/sync/google", {
    method: "POST", body, headers: { "Content-Type": "application/json" },
});

beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ supabase, user: { id: "user-a" } });
    mocks.platform.mockResolvedValue({ businessId, platform });
    mocks.limit.mockResolvedValue({ success: true });
    mocks.admin.mockReturnValue({});
    mocks.send.mockResolvedValue({ ids: ["event-a"] });
});

describe("Google sync API", () => {
    it("loads sync status with the authenticated user and omits private state", async () => {
        const response = await handleGoogleSyncGet(new Request(`http://localhost/api/sync/google?businessId=${businessId}`));
        expect(response.status).toBe(200);
        expect(mocks.platform).toHaveBeenCalledWith(supabase, "user-a", businessId);
        const body = await response.json();
        expect(body.data.total_reviews).toBe(5);
        expect(body.data).not.toHaveProperty("sync_state");
    });

    it("requires write access before starting a background sync", async () => {
        expect((await handleGoogleSyncPost(post())).status).toBe(200);
        expect(mocks.platform).toHaveBeenCalledWith(supabase, "user-a", businessId, true);
        expect(mocks.send).toHaveBeenCalledWith({ name: "google/sync.reviews", data: { platformId: "platform-a" } });
    });

    it("does not enqueue a sync for a viewer, revoked member or foreign business", async () => {
        mocks.platform.mockRejectedValue(new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" }));
        expect((await handleGoogleSyncPost(post())).status).toBe(404);
        expect(mocks.admin).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it.each(["not-json", JSON.stringify({ businessId: "invalid" }), JSON.stringify({ businessId, force: "false" })])
        ("rejects invalid POST input before platform access: %s", async (body) => {
            expect((await handleGoogleSyncPost(post(body))).status).toBe(400);
            expect(mocks.platform).not.toHaveBeenCalled();
            expect(mocks.send).not.toHaveBeenCalled();
        });

    it("rejects invalid GET business IDs before platform access", async () => {
        expect((await handleGoogleSyncGet(new Request("http://localhost/api/sync/google?businessId=invalid"))).status).toBe(400);
        expect(mocks.platform).not.toHaveBeenCalled();
    });

    it("allows an empty POST body to sync the active business", async () => {
        expect((await handleGoogleSyncPost(post(""))).status).toBe(200);
        expect(mocks.platform).toHaveBeenCalledWith(supabase, "user-a", undefined, true);
    });

    it("keeps rate limiting at HTTP 429 and does not enqueue work", async () => {
        mocks.limit.mockResolvedValue({ success: false });
        expect((await handleGoogleSyncPost(post())).status).toBe(429);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("keeps unauthenticated GET requests at HTTP 401", async () => {
        mocks.user.mockRejectedValue(new ApiRouteError("Unauthorized", { status: 401, code: "UNAUTHORIZED" }));
        expect((await handleGoogleSyncGet(new Request("http://localhost/api/sync/google"))).status).toBe(401);
        expect(mocks.platform).not.toHaveBeenCalled();
    });
});
