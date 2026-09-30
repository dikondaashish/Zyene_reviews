import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/supabase/database.types";

const mocks = vi.hoisted(() => ({ active: vi.fn(), access: vi.fn(), admin: vi.fn(), log: vi.fn() }));
vi.mock("@/lib/auth/business-context", () => ({ getActiveBusinessId: mocks.active }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { error: mocks.log } }));

import { getGooglePlatformForUser } from "@/services/google/sync-google-platform";

const businessId = "9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7";
const userId = "user-a";
const platform = { id: "platform-a", platform: "google", sync_status: "idle", last_synced_at: null };
const userClient = {
    from: vi.fn(() => {
        const query = {
            select: vi.fn(() => query), eq: vi.fn(() => query),
            maybeSingle: async () => ({ data: null, error: { code: "42501", message: "permission denied" } }),
        };
        return query;
    }),
} as unknown as SupabaseClient<Database>;

function adminQuery(data: unknown = platform, error: unknown = null) {
    const select = vi.fn<(columns: string) => unknown>();
    const query = { select, eq: vi.fn(() => query),
        maybeSingle: vi.fn().mockResolvedValue({ data, error }) };
    select.mockReturnValue(query);
    const admin = { from: vi.fn(() => query) };
    mocks.admin.mockReturnValue(admin);
    return { admin, query };
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue(true);
    mocks.active.mockResolvedValue({ businessId });
    adminQuery();
});

describe("Google sync platform lookup", () => {
    it("loads backend-only sync fields after verifying live business access", async () => {
        const { admin, query } = adminQuery();
        await expect(getGooglePlatformForUser(userClient, userId, businessId))
            .resolves.toEqual({ businessId, platform });
        expect(mocks.access).toHaveBeenCalledWith(userClient, userId, businessId, false);
        expect(mocks.access.mock.invocationCallOrder[0]).toBeLessThan(mocks.admin.mock.invocationCallOrder[0]);
        expect(admin.from).toHaveBeenCalledWith("review_platforms");
        expect(query.eq).toHaveBeenCalledWith("business_id", businessId);
        expect(query.eq).toHaveBeenCalledWith("platform", "google");
        expect(query.select.mock.calls[0][0]).not.toMatch(/access_token|refresh_token|\*/);
    });

    it.each([false, true])("denies revoked or foreign-tenant access before admin reads (write=%s)", async (write) => {
        mocks.access.mockResolvedValue(false);
        await expect(getGooglePlatformForUser(userClient, userId, businessId, write))
            .rejects.toMatchObject({ status: 404, code: "BUSINESS_NOT_FOUND" });
        expect(mocks.admin).not.toHaveBeenCalled();
    });

    it("requires write membership for manual sync", async () => {
        await getGooglePlatformForUser(userClient, userId, businessId, true);
        expect(mocks.access).toHaveBeenCalledWith(userClient, userId, businessId, true);
    });

    it("resolves the active business when no ID is supplied", async () => {
        await expect(getGooglePlatformForUser(userClient, userId)).resolves.toEqual({ businessId, platform });
        expect(mocks.active).toHaveBeenCalledOnce();
    });

    it("reports a missing Google connection as 404", async () => {
        adminQuery(null);
        await expect(getGooglePlatformForUser(userClient, userId, businessId))
            .rejects.toMatchObject({ status: 404, code: "GOOGLE_PLATFORM_NOT_CONNECTED" });
    });

    it("reports database failures separately without exposing the database error", async () => {
        const error = { code: "42501", message: "private database details" };
        adminQuery(null, error);
        await expect(getGooglePlatformForUser(userClient, userId, businessId))
            .rejects.toMatchObject({ status: 500, code: "GOOGLE_PLATFORM_LOOKUP_FAILED" });
        expect(mocks.log).toHaveBeenCalledWith(expect.objectContaining({ err: error }), expect.any(String));
    });
});
