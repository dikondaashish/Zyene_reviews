import { beforeEach, describe, expect, it, vi } from "vitest";
import type { createAdminClient } from "@/lib/db/supabase/admin";
const mocks = vi.hoisted(() => ({ access: vi.fn(), from: vi.fn(), eq: vi.fn(), single: vi.fn() }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
import { campaignJobSchema, loadAuthorizedCampaignJob } from "@/services/campaigns/campaign-job-access";
const job = { campaignId: "10000000-0000-4000-8000-000000000001", businessId: "10000000-0000-4000-8000-000000000002",
    userId: "10000000-0000-4000-8000-000000000003", contact: { email: "synthetic@example.test" } };

describe("delayed campaign job authorization", () => {
    function admin() { return { from: mocks.from } as unknown as ReturnType<typeof createAdminClient>; }
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.access.mockResolvedValue(true);
        const query = { select: () => query, eq: mocks.eq.mockImplementation(() => query), single: mocks.single };
        mocks.from.mockReturnValue(query);
        mocks.single.mockResolvedValue({ data: { status: "processing", businesses: { organization_id: "org-a" } }, error: null });
    });
    it.each(["foreign tenant", "sibling business", "viewer", "suspended member"])("denies %s before privileged campaign reads", async () => {
        mocks.access.mockResolvedValue(false);
        expect(await loadAuthorizedCampaignJob(admin(), job)).toBeNull();
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), job.userId, job.businessId, true);
        expect(mocks.from).not.toHaveBeenCalled();
    });
    it("requires the campaign and business to match, not just independent valid IDs", async () => {
        expect(await loadAuthorizedCampaignJob(admin(), job)).not.toBeNull();
        expect(mocks.eq).toHaveBeenCalledWith("id", job.campaignId);
        expect(mocks.eq).toHaveBeenCalledWith("business_id", job.businessId);
        mocks.single.mockResolvedValue({ data: null, error: null });
        expect(await loadAuthorizedCampaignJob(admin(), job)).toBeNull();
    });
    it("denies paused campaigns and actor-less historical jobs", async () => {
        mocks.single.mockResolvedValue({ data: { status: "paused", businesses: {} }, error: null });
        expect(await loadAuthorizedCampaignJob(admin(), job)).toBeNull();
        expect(campaignJobSchema.safeParse({ ...job, userId: undefined }).success).toBe(false);
    });
});
