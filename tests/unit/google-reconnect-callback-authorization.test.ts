import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({ canManage: vi.fn(), acceptInvite: vi.fn() }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/lib/auth/accept-business-invitation", () => ({ acceptBusinessInvitationAdmin: mocks.acceptInvite }));
vi.mock("@/services/google/sync-service", () => ({
    reattachOrphanedGoogleReviews: vi.fn(), refreshGoogleReviewRollupsFromDb: vi.fn(),
}));
vi.mock("@/services/google/verify-granted-scopes", () => ({ fetchGoogleGrantedScopes: vi.fn(async () => null) }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: vi.fn() } }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: vi.fn() } }));

import { runOAuthExistingUserLogin } from "@/services/auth/oauth-callback-existing-user";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const VICTIM_BIZ = "22222222-2222-4222-8222-222222222222";
const FIRST_BIZ = "55555555-5555-4555-8555-555555555555";

/** Minimal chainable stand-in for the service-role client; records every review_platforms update. */
function fakeAdmin() {
    const updates: Array<{ payload: Record<string, unknown>; id: unknown }> = [];
    const chain = (table: string) => {
        const q: Record<string, unknown> = {};
        for (const m of ["select", "eq", "limit", "insert"]) q[m] = () => q;
        q.single = async () => ({ data: table === "review_platforms" ? { id: "platform-1" } : null, error: null });
        q.maybeSingle = async () => ({
            data: table === "organization_members" ? { organizations: { businesses: [{ id: FIRST_BIZ }] } } : null,
            error: null,
        });
        q.update = (payload: Record<string, unknown>) => ({
            eq: async (_c: string, id: unknown) => { updates.push({ payload, id }); return { error: null }; },
        });
        return q;
    };
    const admin = {
        from: (table: string) => chain(table),
        rpc: async () => ({ data: "encrypted", error: null }),
    } as unknown as SupabaseClient;
    return { admin, updates };
}

function run(admin: SupabaseClient, biz: string | null) {
    return runOAuthExistingUserLogin({
        admin,
        data: {
            user: { id: USER_ID, app_metadata: { provider: "google" }, identities: [] },
            session: { provider_token: "attacker-access", provider_refresh_token: "attacker-refresh" },
        } as never,
        appUrl: "https://app.example.com",
        next: "/integrations",
        biz,
        inviteParamForAccept: "",
    });
}

describe("Google reconnect callback authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.acceptInvite.mockResolvedValue({ accepted: false });
    });

    it("does not write tokens for a biz the user cannot manage (viewer or suspended member)", async () => {
        mocks.canManage.mockResolvedValue(false);
        const { admin, updates } = fakeAdmin();
        const response = await run(admin, VICTIM_BIZ);
        expect(mocks.canManage).toHaveBeenCalledWith(admin, USER_ID, VICTIM_BIZ);
        expect(updates).toHaveLength(0);
        expect(response.headers.get("location")).toBe("https://app.example.com/integrations");
    });

    it("never falls back to another business when the explicit biz is refused", async () => {
        mocks.canManage.mockImplementation(async (_a: unknown, _u: string, id: string) => id === FIRST_BIZ);
        const { admin, updates } = fakeAdmin();
        await run(admin, VICTIM_BIZ);
        expect(mocks.canManage).toHaveBeenCalledTimes(1);
        expect(updates).toHaveLength(0);
    });

    it("updates tokens when the user manages the business", async () => {
        mocks.canManage.mockResolvedValue(true);
        const { admin, updates } = fakeAdmin();
        await run(admin, VICTIM_BIZ);
        expect(updates).toHaveLength(1);
        expect(updates[0].payload).toMatchObject({ access_token: "encrypted", refresh_token: "encrypted" });
    });

    it("applies the same check to the first-business fallback when no biz is given", async () => {
        mocks.canManage.mockResolvedValue(false);
        const { admin, updates } = fakeAdmin();
        await run(admin, null);
        expect(mocks.canManage).toHaveBeenCalledWith(admin, USER_ID, FIRST_BIZ);
        expect(updates).toHaveLength(0);
    });
});
