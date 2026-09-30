import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { canAddBusinessToOrganization } from "@/services/auth/add-business-authorization";

function memberLookup(result: { organization_id: string } | null) {
    const query = {
        select: vi.fn(),
        eq: vi.fn(),
        in: vi.fn(),
        maybeSingle: vi.fn().mockResolvedValue({ data: result, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    const from = vi.fn().mockReturnValue(query);
    return { client: { from } as unknown as SupabaseClient<Database>, from, query };
}

describe("add-business organization authorization", () => {
    it("requires the authenticated user's active membership in the exact organization", async () => {
        const { client, from, query } = memberLookup({ organization_id: "other-org" });

        expect(await canAddBusinessToOrganization(client, "user-a", "target-org")).toBe(false);
        expect(from).toHaveBeenCalledWith("organization_members");
        expect(query.eq).toHaveBeenCalledWith("user_id", "user-a");
        expect(query.eq).toHaveBeenCalledWith("organization_id", "target-org");
        expect(query.eq).toHaveBeenCalledWith("status", "active");
        expect(query.in).toHaveBeenCalledWith("role", expect.arrayContaining(["owner", "admin"]));
    });

    it("allows a matching active organization administrator", async () => {
        const { client } = memberLookup({ organization_id: "target-org" });

        expect(await canAddBusinessToOrganization(client, "user-a", "target-org")).toBe(true);
    });
});
