import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertTeamInviteSeatAvailable } from "@/services/team/invite-seat-checks";

vi.mock("@/services/stripe/plans", () => ({ teamMemberLimitForPlan: () => 2 }));

function client(labels: Array<string | null>, pending = 0) {
    return { from(table: string) {
        let head = false;
        let excludeDevelopers = false;
        const query = {
            select(_columns: string, options?: { head?: boolean }) { head = !!options?.head; return query; },
            eq() { return query; },
            is() { return query; },
            or(filter: string) {
                excludeDevelopers = filter === "role_label.is.null,role_label.neq.developer";
                return query;
            },
            then(resolve: (value: unknown) => void) {
                resolve({
                    data: head ? null : labels.map((_, i) => ({ users: { email: `member${i}@example.test` } })),
                    count: table === "invitations" ? pending : labels.filter(label => !excludeDevelopers || label !== "developer").length,
                    error: null,
                });
            },
        };
        return query;
    } } as unknown as SupabaseClient;
}

const params = { businessId: "business", organizationId: "org", email: "new@example.test",
    plan: "starter", planStatus: "active" };

describe("developer support does not consume customer team seats", () => {
    it("allows a customer invite when the second member is the default developer", async () => {
        expect(await assertTeamInviteSeatAvailable(client([null, "developer"]), params)).toBeNull();
    });

    it("still enforces the limit for customer members", async () => {
        expect((await assertTeamInviteSeatAvailable(client([null, null, "developer"]), params))?.status).toBe(403);
    });

    it("still counts pending invitations", async () => {
        expect((await assertTeamInviteSeatAvailable(client([null, "developer"], 1), params))?.status).toBe(403);
    });
});
