import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

function clientWithRows(rows: {
    business?: { id: string; organization_id: string } | null;
    businessMember?: { role: string } | null;
    orgMember?: { role: string } | null;
}) {
    const queries: Array<{ table: string; filters: Record<string, string> }> = [];
    const from = vi.fn((table: string) => {
        const filters: Record<string, string> = {};
        queries.push({ table, filters });
        const builder = {
            select: () => builder,
            eq: (key: string, value: string) => {
                filters[key] = value;
                return builder;
            },
            maybeSingle: async () => ({
                data: table === "businesses" ? rows.business ?? null :
                    table === "business_members" ? rows.businessMember ?? null : rows.orgMember ?? null,
                error: null,
            }),
        };
        return builder;
    });
    return { client: { from } as unknown as SupabaseClient<Database>, queries };
}

describe("integration management authorization", () => {
    it("rejects a foreign business before membership or privileged access", async () => {
        const { client, queries } = clientWithRows({ business: null });
        expect(await canManageBusinessIntegration(client, "user-a", "business-b")).toBe(false);
        expect(queries.map((query) => query.table)).toEqual(["businesses"]);
    });

    it("rejects a viewer and an inactive member", async () => {
        const { client, queries } = clientWithRows({
            business: { id: "business-a", organization_id: "org-a" },
            businessMember: { role: "viewer" },
            orgMember: null,
        });
        expect(await canManageBusinessIntegration(client, "user-a", "business-a")).toBe(false);
        expect(queries.find((query) => query.table === "business_members")?.filters).toMatchObject({
            business_id: "business-a", user_id: "user-a", status: "active",
        });
        expect(queries.find((query) => query.table === "organization_members")?.filters).toMatchObject({
            organization_id: "org-a", user_id: "user-a", status: "active",
        });
    });

    it("allows an active manager of the owning organization", async () => {
        const { client } = clientWithRows({
            business: { id: "business-a", organization_id: "org-a" },
            orgMember: { role: "manager" },
        });
        expect(await canManageBusinessIntegration(client, "user-a", "business-a")).toBe(true);
    });
    it("rejects a business manager whose organization membership was suspended", async () => {
        const { client } = clientWithRows({
            business: { id: "business-a", organization_id: "org-a" },
            businessMember: { role: "manager" }, orgMember: null,
        });
        expect(await canManageBusinessIntegration(client, "user-a", "business-a")).toBe(false);
    });
    it("allows a business-scoped manager with active nonprivileged organization membership", async () => {
        const { client } = clientWithRows({
            business: { id: "business-a", organization_id: "org-a" },
            businessMember: { role: "manager" }, orgMember: { role: "ORG_EMPLOYEE" },
        });
        expect(await canManageBusinessIntegration(client, "user-a", "business-a")).toBe(true);
    });
});
