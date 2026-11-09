import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    acquire: vi.fn(),
    release: vi.fn(async () => {}),
    recover: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: vi.fn(async () => 1) } }));
vi.mock("@/lib/db/redis-lock", () => ({ acquireLock: mocks.acquire, releaseLock: mocks.release }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: { id: "u1", email: "a@b.co", user_metadata: {} } } }) },
    }),
}));
vi.mock("@/services/auth/recover-onboarding-workspace", () => ({ recoverOnboardingWorkspace: mocks.recover }));

import { completeOnboardingWorkspaceSetup } from "@/app/actions/onboarding/workspace-recovery";

describe("completeOnboardingWorkspaceSetup lock", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.recover.mockResolvedValue({ success: true, repaired: true });
    });

    it("does not run a second repair while another tab holds the lock", async () => {
        mocks.acquire.mockResolvedValue(false);
        const res = await completeOnboardingWorkspaceSetup();
        expect(res.success).toBe(false);
        expect(mocks.recover).not.toHaveBeenCalled();
    });

    it("repairs under a per-user lock and releases it", async () => {
        mocks.acquire.mockResolvedValue(true);
        const res = await completeOnboardingWorkspaceSetup();
        expect(res).toEqual({ success: true, repaired: true });
        expect(mocks.acquire).toHaveBeenCalledWith("onboarding-workspace-repair:u1", 60);
        expect(mocks.release).toHaveBeenCalledWith("onboarding-workspace-repair:u1");
    });

    it("still repairs when Redis is unavailable", async () => {
        mocks.acquire.mockRejectedValue(new Error("redis down"));
        const res = await completeOnboardingWorkspaceSetup();
        expect(res.success).toBe(true);
        expect(mocks.release).not.toHaveBeenCalled();
    });
});
