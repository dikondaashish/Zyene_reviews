import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/supabase/database.types";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { loadUserBusinessContext } from "@/lib/auth/business-context-load";

const redis = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/db/redis", () => ({ redis }));

function client(rows: Record<string, unknown>, error: unknown = null) {
    const filters: Record<string, Record<string, string>> = {};
    const from = vi.fn((table: string) => {
        filters[table] = {};
        const query = {
            select: () => query,
            eq: (key: string, value: string) => { filters[table][key] = value; return query; },
            maybeSingle: async () => ({ data: rows[table] ?? null, error }),
            then: (resolve: (result: unknown) => unknown) => Promise.resolve({ data: rows[table], error }).then(resolve),
        };
        return query;
    });
    return { supabase: { from } as unknown as SupabaseClient<Database>, filters };
}

describe("live business authorization", () => {
    it.each([null, { role: "ORG_EMPLOYEE" }])("denies a removed member with org row %j", async (org) => {
        const { supabase, filters } = client({ businesses: { id: "b", organization_id: "o" }, organization_members: org });
        expect(await userCanAccessBusiness(supabase, "u", "b")).toBe(false);
        expect(filters.organization_members).toMatchObject({ user_id: "u", organization_id: "o", status: "active" });
    });
    it("allows only an active explicit employee business membership", async () => {
        const { supabase, filters } = client({ businesses: { id: "b", organization_id: "o" },
            organization_members: { role: "ORG_EMPLOYEE" }, business_members: { role: "member" } });
        expect(await userCanAccessBusiness(supabase, "u", "b")).toBe(true);
        expect(filters.business_members).toMatchObject({ business_id: "b", user_id: "u", status: "active" });
    });
    it("fails closed on database errors", async () => {
        const { supabase } = client({ businesses: { id: "b", organization_id: "o" } }, new Error("unavailable"));
        expect(await userCanAccessBusiness(supabase, "u", "b")).toBe(false);
    });
    it("permits viewer reads but denies service-role write authorization", async () => {
        const { supabase } = client({ businesses: { id: "b", organization_id: "o" },
            organization_members: { role: "ORG_EMPLOYEE" }, business_members: { role: "viewer" } });
        expect(await userCanAccessBusiness(supabase, "u", "b")).toBe(true);
        expect(await userCanAccessBusiness(supabase, "u", "b", true)).toBe(false);
    });
    it("ignores stale Redis and strips other businesses from an employee's org context", async () => {
        redis.get.mockResolvedValue({ businesses: [{ id: "revoked" }] });
        const { supabase, filters } = client({ business_members: [], organization_members: [
            { role: "ORG_EMPLOYEE", organization_id: "o", organizations: { id: "o", businesses: [{ id: "revoked" }] } },
        ] });
        const result = await loadUserBusinessContext(supabase, "u", false);
        expect(result.businesses).toEqual([]);
        expect(result.organizations[0].businesses).toEqual([]);
        expect(redis.get).not.toHaveBeenCalled();
        expect(filters.business_members.status).toBe("active");
    });
    it("retains intended org-wide management across multiple organizations", async () => {
        const { supabase } = client({ business_members: [], organization_members: ["a", "b"].map((id) => ({
            role: "ORG_ADMIN", organization_id: id, organizations: { id, businesses: [{ id: `${id}-business` }] },
        })) });
        expect((await loadUserBusinessContext(supabase, "u", false)).businesses.map((b) => b.id))
            .toEqual(["a-business", "b-business"]);
    });
});
