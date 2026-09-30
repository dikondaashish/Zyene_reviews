import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(),
    createAdminClient: vi.fn(),
    canManage: vi.fn(),
}));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: mocks.canManage,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { disconnectGoogle } from "@/app/(dashboard)/settings/integrations/actions";

const PLATFORM_ID = "11111111-1111-4111-8111-111111111111";

describe("Google disconnect authorization", () => {
    it("does not create an admin client for another tenant's integration", async () => {
        mocks.createAdminClient.mockClear();
        mocks.canManage.mockResolvedValue(false);
        const query = {
            select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(),
        };
        query.select.mockReturnValue(query);
        query.eq.mockReturnValue(query);
        query.maybeSingle.mockResolvedValue({
            data: { id: PLATFORM_ID, business_id: "foreign-business" }, error: null,
        });
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "attacker" } } }) },
            from: vi.fn(() => query),
        });

        await expect(disconnectGoogle(PLATFORM_ID)).rejects.toThrow("permission denied");
        expect(mocks.canManage).toHaveBeenCalledWith(
            expect.anything(), "attacker", "foreign-business",
        );
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });
    it("scopes privileged review hiding and platform deletion to the authorized business", async () => {
        mocks.canManage.mockResolvedValue(true);
        const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
        query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
        query.maybeSingle.mockResolvedValue({ data: { id: PLATFORM_ID, business_id: "business-a" }, error: null });
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "manager" } } }) }, from: () => query,
        });
        const filters: Record<string, Record<string, string>> = {};
        mocks.createAdminClient.mockReturnValue({ from: (table: string) => {
            filters[table] = {};
            const builder = { update: () => builder, delete: () => builder,
                eq: (key: string, value: string) => { filters[table][key] = value; return builder; },
                then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve),
            };
            return builder;
        } });
        await disconnectGoogle(PLATFORM_ID);
        expect(filters.reviews).toEqual({ platform_id: PLATFORM_ID, business_id: "business-a" });
        expect(filters.review_platforms).toEqual({ id: PLATFORM_ID, business_id: "business-a" });
    });
});
