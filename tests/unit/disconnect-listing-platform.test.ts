import { beforeEach, describe, expect, it, vi } from "vitest";

const PLATFORM_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

const mocks = vi.hoisted(() => ({
    platformRow: null as { id: string; business_id: string } | null,
    canManage: vi.fn(),
    deleteEq: vi.fn(),
    selectEq: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => {
        const query = {
            select: () => query,
            eq: (column: string, value: string) => {
                mocks.selectEq(column, value);
                return query;
            },
            maybeSingle: async () => ({ data: mocks.platformRow, error: null }),
        };
        return {
            auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
            from: () => query,
        };
    },
}));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => {
        const del = {
            eq: (column: string, value: string) => {
                mocks.deleteEq(column, value);
                return column === "business_id" ? Promise.resolve({ error: null }) : del;
            },
        };
        return { from: () => ({ delete: () => del }) };
    },
}));

import { disconnectListingPlatform } from "@/app/(dashboard)/settings/integrations/disconnect-listing-platform";

describe("disconnectListingPlatform", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.platformRow = { id: PLATFORM_ID, business_id: BUSINESS_ID };
        mocks.canManage.mockResolvedValue(true);
    });

    it("deletes only the matching platform row for a manager", async () => {
        await expect(disconnectListingPlatform(PLATFORM_ID, "facebook")).resolves.toEqual({ ok: true });
        expect(mocks.selectEq).toHaveBeenCalledWith("platform", "facebook");
        expect(mocks.deleteEq).toHaveBeenCalledWith("id", PLATFORM_ID);
        expect(mocks.deleteEq).toHaveBeenCalledWith("business_id", BUSINESS_ID);
        expect(mocks.revalidatePath).toHaveBeenCalled();
    });

    it("refuses users who cannot manage the business", async () => {
        mocks.canManage.mockResolvedValue(false);
        const result = await disconnectListingPlatform(PLATFORM_ID, "yelp");
        expect(result.ok).toBe(false);
        expect(mocks.deleteEq).not.toHaveBeenCalled();
    });

    it("refuses a platform id that is not a row of that platform", async () => {
        mocks.platformRow = null;
        await expect(disconnectListingPlatform(PLATFORM_ID, "yelp"))
            .resolves.toEqual({ ok: false, error: "Integration not found" });
        expect(mocks.deleteEq).not.toHaveBeenCalled();
    });

    it("rejects invalid input before touching the database", async () => {
        const result = await disconnectListingPlatform("not-a-uuid", "facebook");
        expect(result).toEqual({ ok: false, error: "Invalid integration" });
        expect(mocks.selectEq).not.toHaveBeenCalled();
    });
});
