import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteTeamMember } from "@/services/team/team-member-api";

const mocks = vi.hoisted(() => ({
    getUser: vi.fn(), single: vi.fn(), maybeSingle: vi.fn(), rpc: vi.fn(), eq: vi.fn(), from: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/lib/auth/business-context", () => ({
    getActiveBusinessId: vi.fn().mockResolvedValue({ businessId: "selected-business", organization: { id: "selected-org" } }),
}));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from, rpc: mocks.rpc })),
}));

const id = "90000000-0000-4000-8000-000000000001";
const remove = (memberId = id) => deleteTeamMember(new Request(`https://example.test/api/team/${memberId}`), {
    params: Promise.resolve({ id: memberId }),
});

beforeEach(() => {
    vi.clearAllMocks();
    const builder = { select: vi.fn().mockReturnThis(), eq: mocks.eq, single: mocks.single, maybeSingle: mocks.maybeSingle };
    mocks.eq.mockReturnValue(builder);
    mocks.from.mockReturnValue(builder);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "actor" } } });
    mocks.single.mockResolvedValue({ data: { role: "owner", business_id: "selected-business" }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: { id, role: "owner", user_id: "target", role_label: "developer" } });
    mocks.rpc.mockResolvedValue({ error: null });
});

describe("developer delete API boundary", () => {
    it("does not read memberships or invoke deletion without a verified user", async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } });
        expect((await remove()).status).toBe(401);
        expect(mocks.from).not.toHaveBeenCalled();
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("rejects malformed IDs before reading memberships", async () => {
        expect((await remove("bad-id")).status).toBe(400);
        expect(mocks.from).not.toHaveBeenCalled();
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("scopes target lookup to the selected business and cannot remove a foreign target", async () => {
        mocks.maybeSingle.mockResolvedValue({ data: null });
        expect((await remove()).status).toBe(404);
        expect(mocks.eq).toHaveBeenCalledWith("business_id", "selected-business");
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("requires active team-management access before deletion", async () => {
        mocks.single.mockResolvedValue({ data: null, error: null });
        expect((await remove()).status).toBe(403);
        expect(mocks.eq).toHaveBeenCalledWith("status", "active");
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("delegates to live database authorization and propagates a denial", async () => {
        mocks.rpc.mockResolvedValue({ error: { code: "42501" } });
        expect((await remove()).status).toBe(403);
        expect(mocks.rpc).toHaveBeenCalledWith("delete_organization_developer", {
            target_business: "selected-business", target_member: id,
        });
    });

    it("returns success only after the atomic removal succeeds", async () => {
        expect((await remove()).status).toBe(200);
        expect(mocks.rpc).toHaveBeenCalledTimes(1);
    });
});
