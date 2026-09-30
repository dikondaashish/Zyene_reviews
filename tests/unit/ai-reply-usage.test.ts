import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

const mocks = vi.hoisted(() => ({
    access: vi.fn(), admin: vi.fn(), rpc: vi.fn(), getUser: vi.fn(), business: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
import { recordAiReplyUsage } from "@/services/ai/record-reply-usage";

describe("backend AI usage authorization", () => {
    const client = {
        auth: { getUser: mocks.getUser },
        from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.business }) }) }),
    } as unknown as SupabaseClient<Database>;
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.getUser.mockResolvedValue({ data: { user: { id: "user-a" } }, error: null });
        mocks.access.mockResolvedValue(true);
        mocks.business.mockResolvedValue({ data: { organization_id: "org-a" }, error: null });
        mocks.rpc.mockResolvedValue({ error: null });
        mocks.admin.mockReturnValue({ rpc: mocks.rpc });
    });
    it("derives the organization only after live business authorization", async () => {
        await recordAiReplyUsage(client, "business-a");
        expect(mocks.access).toHaveBeenCalledWith(client, "user-a", "business-a");
        expect(mocks.rpc).toHaveBeenCalledWith("increment_ai_replies_used", { org_id: "org-a" });
    });
    it.each(["foreign-tenant", "sibling-business", "suspended-member"])("denies %s before admin access", async (id) => {
        mocks.access.mockResolvedValue(false);
        await expect(recordAiReplyUsage(client, id)).rejects.toThrow("denied");
        expect(mocks.admin).not.toHaveBeenCalled();
    });
    it("denies unauthenticated callers before admin access", async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
        await expect(recordAiReplyUsage(client, "business-a")).rejects.toThrow("denied");
        expect(mocks.admin).not.toHaveBeenCalled();
    });
    it("denies missing or unreadable business organization", async () => {
        mocks.business.mockResolvedValue({ data: null, error: { message: "denied" } });
        await expect(recordAiReplyUsage(client, "business-a")).rejects.toThrow("denied");
        expect(mocks.admin).not.toHaveBeenCalled();
    });
    it("does not silently ignore accounting failure", async () => {
        mocks.rpc.mockResolvedValue({ error: { message: "backend unavailable" } });
        await expect(recordAiReplyUsage(client, "business-a")).rejects.toThrow("failed");
    });
    it("routes both interactive generators through authorized backend accounting", () => {
        for (const file of ["suggest-reply-api.ts", "suggest-qa-answer-api.ts"]) {
            const source = readFileSync(`src/services/ai/${file}`, "utf8");
            expect(source).toContain("await recordAiReplyUsage(supabase, businessId)");
            expect(source).not.toContain('supabase.rpc("increment_ai_replies_used"');
        }
    });
});
