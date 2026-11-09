import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), redisDel: vi.fn() }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: mocks.redisDel } }));
vi.mock("server-only", () => ({}));

import { deleteBusiness } from "@/services/businesses/business-by-id-api";

type Member = { user_id: string; organization_id: string; role: string; status: string };
type Filter = { col: string; op: "eq" | "neq" | "in"; val: unknown };

const businessId = "22222222-2222-4222-8222-222222222222";
const orgId = "org-1";

/**
 * Scripted Supabase client: organization_members honours eq/in filters on the member row,
 * businesses UPDATE returns rows only when `rlsAllowsUpdate` (models businesses_update RLS).
 */
function fakeSupabase(member: Member, rlsAllowsUpdate: boolean) {
    const updates: unknown[] = [];
    const from = (table: string) => {
        const filters: Filter[] = [];
        let op: "select" | "update" = "select";
        let selectedAfterUpdate = false;
        const run = () => {
            if (table === "organization_members") {
                const ok = filters.every((f) => {
                    if (f.col.includes(".")) return true; // nested join filter on the business id
                    const v = (member as Record<string, unknown>)[f.col];
                    return f.op === "in" ? (f.val as unknown[]).includes(v) : v === f.val;
                });
                return { data: ok ? { organization_id: member.organization_id } : null, error: null };
            }
            if (op === "update") {
                return { data: selectedAfterUpdate ? (rlsAllowsUpdate ? [{ id: businessId }] : []) : null, error: null };
            }
            return { data: null, error: null, count: 3 };
        };
        const q = {
            select: () => { if (op === "update") selectedAfterUpdate = true; return q; },
            update: (patch: unknown) => { op = "update"; updates.push(patch); return q; },
            eq: (col: string, val: unknown) => { filters.push({ col, op: "eq", val }); return q; },
            neq: (col: string, val: unknown) => { filters.push({ col, op: "neq", val }); return q; },
            in: (col: string, val: unknown[]) => { filters.push({ col, op: "in", val }); return q; },
            maybeSingle: () => Promise.resolve(run()),
            then: <T>(resolve: (v: ReturnType<typeof run>) => T) => Promise.resolve(run()).then(resolve),
        };
        return q;
    };
    return { client: { from }, updates };
}

function call() {
    return deleteBusiness(new Request("https://example.test", { method: "DELETE" }), {
        params: Promise.resolve({ id: businessId }),
    });
}

function setup(role: string, status: string, rlsAllowsUpdate: boolean) {
    const fake = fakeSupabase({ user_id: "user-1", organization_id: orgId, role, status }, rlsAllowsUpdate);
    mocks.requireUser.mockResolvedValue({ supabase: fake.client, user: { id: "user-1" } });
    return fake;
}

describe("DELETE /api/businesses/[id] authorization", () => {
    beforeEach(() => vi.clearAllMocks());

    it.each(["member", "viewer"])("rejects an org %s with 403 instead of reporting success", async (role) => {
        const fake = setup(role, "active", false);
        const res = await call();
        expect(res.status).toBe(403);
        expect((await res.json()).success).toBe(false);
        expect(fake.updates).toHaveLength(0);
    });

    it("rejects an inactive owner", async () => {
        const fake = setup("owner", "invited", true);
        expect((await call()).status).toBe(403);
        expect(fake.updates).toHaveLength(0);
    });

    it("returns 403 when RLS archives zero rows", async () => {
        setup("ORG_ADMIN", "active", false);
        const res = await call();
        expect(res.status).toBe(403);
        expect((await res.json()).code).toBe("BUSINESS_DELETE_FORBIDDEN");
        expect(mocks.redisDel).not.toHaveBeenCalled();
    });

    it("archives the business for an active owner", async () => {
        const fake = setup("ORG_OWNER", "active", true);
        const res = await call();
        expect(res.status).toBe(200);
        expect((await res.json()).data).toEqual({ success: true });
        expect(fake.updates).toHaveLength(1);
        expect(mocks.redisDel).toHaveBeenCalledWith("user_businesses:user-1");
    });
});
