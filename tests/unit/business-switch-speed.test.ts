import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/supabase/database.types";

const m = vi.hoisted(() => ({
    cookieSet: vi.fn(), revalidatePath: vi.fn(), redirect: vi.fn(), canAccess: vi.fn(), clearCache: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/redis", () => ({ redis: { del: vi.fn() } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: m.cookieSet, get: () => undefined }) }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: m.canAccess }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
        from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "b2" }, error: null }) }) }) }),
    }),
}));

const { loadUserBusinessContext } = await import("@/lib/auth/business-context-load");
const { openBusiness } = await import("@/lib/auth/business-context");

describe("loading business context", () => {
    it("asks for business and organization memberships at the same time", async () => {
        const started: string[] = [];
        const release: Array<() => void> = [];
        const from = (table: string) => {
            started.push(table);
            const query = {
                select: () => query, eq: () => query,
                then: (resolve: (r: unknown) => unknown) => new Promise((done) => release.push(() => done({ data: [], error: null }))).then(resolve),
            };
            return query;
        };
        const pending = loadUserBusinessContext({ from } as unknown as SupabaseClient<Database>, "u1", false);
        await new Promise((r) => setTimeout(r, 0));
        // Both queries are in flight before either has answered.
        expect(started).toEqual(["business_members", "organization_members"]);
        release.forEach((done) => done());
        expect(await pending).toEqual({ organizations: [], businesses: [] });
    });
});

describe("openBusiness", () => {
    beforeEach(() => { Object.values(m).forEach((fn) => fn.mockReset()); m.canAccess.mockResolvedValue(true); });

    it("switches and goes straight to the chosen page in one step", async () => {
        await openBusiness("b2", "/reviews");
        expect(m.cookieSet).toHaveBeenCalledWith("active_business_id", "b2", expect.objectContaining({ httpOnly: true }));
        expect(m.revalidatePath).toHaveBeenCalledWith("/", "layout");
        expect(m.redirect).toHaveBeenCalledWith("/reviews");
    });

    it("refuses pages outside the business directory's list, before switching", async () => {
        for (const destination of ["https://evil.example", "//evil.example", "/api/admin", ""]) {
            await expect(openBusiness("b2", destination)).rejects.toThrow("Unknown destination");
        }
        expect(m.cookieSet).not.toHaveBeenCalled();
        expect(m.redirect).not.toHaveBeenCalled();
    });

    it("does not switch to a business the user can't access", async () => {
        m.canAccess.mockResolvedValue(false);
        await expect(openBusiness("b2", "/dashboard")).rejects.toThrow("access denied");
        expect(m.cookieSet).not.toHaveBeenCalled();
        expect(m.redirect).not.toHaveBeenCalled();
    });
});
