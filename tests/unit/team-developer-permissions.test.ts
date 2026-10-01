import { describe, expect, it, vi } from "vitest";
import { teamTableCanOpenActionsMenu, teamTableShowOwnerAdminRoleItems } from "@/components/settings/team-table-permissions";
import type { TeamTableMember } from "@/components/settings/team-table-types";
import { deleteDeveloper } from "@/services/team/delete-developer";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

const member: TeamTableMember = {
    id: "membership", userId: "developer", role: "owner", roleLabel: "developer", type: "member", status: "active",
};

describe("developer removal", () => {
    it("exposes the menu only to an authorized owner, never to self", () => {
        expect(teamTableCanOpenActionsMenu(member, "owner", "owner", true)).toBe(true);
        for (const role of ["owner", "admin", "manager", "viewer"]) {
            expect(teamTableCanOpenActionsMenu(member, "other", role, false)).toBe(false);
        }
        expect(teamTableCanOpenActionsMenu(member, "developer", "owner", true)).toBe(false);
        expect(teamTableShowOwnerAdminRoleItems(member, "owner")).toBe(false);
    });

    it("uses the authenticated atomic RPC with the exact business and membership", async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const result = await deleteDeveloper({ rpc }, "business", "membership");
        expect(result.status).toBe(200);
        expect(rpc).toHaveBeenCalledWith("delete_organization_developer", {
            target_business: "business", target_member: "membership",
        });
    });

    it("fails closed on revoked permission and database errors", async () => {
        for (const [code, status] of [["42501", 403], ["XX000", 500]] as const) {
            const rpc = vi.fn().mockResolvedValue({ error: { code, message: "private database detail" } });
            const result = await deleteDeveloper({ rpc }, "business", "membership");
            expect(result.status).toBe(status);
            expect(await result.text()).not.toContain("private database detail");
        }
    });
});
