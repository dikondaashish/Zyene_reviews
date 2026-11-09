import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { userCanAccessBusinessOrThrow } from "@/lib/db/supabase/verify-business-access-strict";

type Res = { data: unknown; error: { message: string } | null };

/** Each from(table) resolves maybeSingle() with the configured result. */
function client(results: Record<string, Res>) {
    return {
        from(table: string) {
            const q = { select: () => q, eq: () => q, maybeSingle: async () => results[table] ?? { data: null, error: null } };
            return q;
        },
    } as unknown as SupabaseClient<Database>;
}

const biz: Res = { data: { id: "b1", organization_id: "o1" }, error: null };

describe("userCanAccessBusinessOrThrow", () => {
    it("throws on a query error instead of reporting no access", async () => {
        await expect(userCanAccessBusinessOrThrow(client({ businesses: { data: null, error: { message: "503" } } }), "u", "b1")).rejects.toThrow(/503/);
        await expect(userCanAccessBusinessOrThrow(client({ businesses: biz, organization_members: { data: null, error: { message: "timeout" } } }), "u", "b1")).rejects.toThrow(/timeout/);
        await expect(userCanAccessBusinessOrThrow(client({
            businesses: biz, organization_members: { data: { role: "member" }, error: null }, business_members: { data: null, error: { message: "boom" } },
        }), "u", "b1")).rejects.toThrow(/boom/);
    });

    it("returns false only for a definite missing membership", async () => {
        expect(await userCanAccessBusinessOrThrow(client({ businesses: biz }), "u", "b1")).toBe(false);
        expect(await userCanAccessBusinessOrThrow(client({ businesses: biz, organization_members: { data: { role: "member" }, error: null } }), "u", "b1")).toBe(false);
    });

    it("grants org managers and active business members", async () => {
        expect(await userCanAccessBusinessOrThrow(client({ businesses: biz, organization_members: { data: { role: "owner" }, error: null } }), "u", "b1")).toBe(true);
        expect(await userCanAccessBusinessOrThrow(client({
            businesses: biz, organization_members: { data: { role: "member" }, error: null }, business_members: { data: { role: "viewer" }, error: null },
        }), "u", "b1")).toBe(true);
    });
});
