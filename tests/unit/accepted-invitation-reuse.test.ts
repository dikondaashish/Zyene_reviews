import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ clearCache: vi.fn() }));
vi.mock("@/lib/auth/business-context-load", () => ({ clearBusinessContextCache: mocks.clearCache }));
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";

function adminForInvite(options: { email?: string; result?: string | null; error?: Error }) {
    const rpc = vi.fn().mockResolvedValue({ data: options.result ?? null, error: options.error });
    const update = vi.fn().mockReturnValue({ eq: async () => ({ error: null }) });
    const query = {
        select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: { id: "invite-a", email: options.email ?? "user@example.com" } }),
    };
    const from = vi.fn((table: string) => table === "users" ? { update } : query);
    return { admin: { from, rpc } as never, from, rpc, update };
}
const params = { userId: "user-a", userEmail: "user@example.com", inviteParam: "opaque-token" };

describe("atomic invitation acceptance", () => {
    beforeEach(() => vi.clearAllMocks());
    it("does not recreate memberships when the transaction rejects reuse", async () => {
        const { admin, from, update } = adminForInvite({});
        expect(await acceptBusinessInvitationAdmin({ admin, ...params })).toEqual({ accepted: false });
        expect(from.mock.calls.map(call => call[0])).toEqual(["invitations"]);
        expect(update).not.toHaveBeenCalled();
    });
    it("passes only the authenticated identity to the database transaction", async () => {
        const { admin, rpc } = adminForInvite({ result: "business-a" });
        expect(await acceptBusinessInvitationAdmin({ admin, ...params })).toEqual({ accepted: true, businessId: "business-a" });
        expect(rpc).toHaveBeenCalledWith("accept_business_invitation", {
            p_invitation_id: "invite-a", p_user_id: "user-a", p_verified_email: "user@example.com",
        });
        expect(mocks.clearCache).toHaveBeenCalledWith("user-a");
    });
    it("rejects a token bound to another email before membership work", async () => {
        const { admin, rpc } = adminForInvite({ email: "other@example.com" });
        expect(await acceptBusinessInvitationAdmin({ admin, ...params })).toEqual({ accepted: false });
        expect(rpc).not.toHaveBeenCalled();
    });
    it("fails closed on a transaction failure without onboarding side effects", async () => {
        const { admin, update } = adminForInvite({ error: new Error("synthetic transaction failure") });
        await expect(acceptBusinessInvitationAdmin({ admin, ...params })).rejects.toThrow("transaction failure");
        expect(update).not.toHaveBeenCalled();
        expect(mocks.clearCache).not.toHaveBeenCalled();
    });
});
