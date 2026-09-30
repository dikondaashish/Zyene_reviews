import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), load: vi.fn(), permission: vi.fn(), reserve: vi.fn(),
    send: vi.fn(), bump: vi.fn(), eq: vi.fn(), sleep: vi.fn(), insert: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_config: unknown, _trigger: unknown, handler: unknown) => ({ handler }) } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/campaigns/campaign-job-access", async importOriginal => ({
    ...await importOriginal<typeof import("@/services/campaigns/campaign-job-access")>(),
    loadAuthorizedCampaignJob: mocks.load, campaignContactPermission: mocks.permission,
}));
vi.mock("@/lib/stripe/reserve-channel-usage", () => ({ reserveChannelUsage: mocks.reserve }));
vi.mock("@/lib/notifications/review-request", () => ({ sendReviewRequest: mocks.send }));
vi.mock("@/lib/review-requests/bump-after-send", () => ({ bumpCustomerAfterSend: mocks.bump }));
import { processCampaignContact } from "@/services/inngest/functions/process-campaign-contact-function";
const job = { campaignId: "10000000-0000-4000-8000-000000000001", businessId: "10000000-0000-4000-8000-000000000002",
    userId: "10000000-0000-4000-8000-000000000003", contact: { email: "synthetic@example.test" } };
const campaign = { channel: "email", delay_minutes: 60, follow_up_enabled: true, sms_template: null, email_template: null,
    businesses: { organization_id: "org-a", name: "Synthetic business", sender_name: null, review_request_frequency_cap_days: 30 } };
type Context = { event: { id: string; data: unknown }; step: {
    run: <T>(name: string, callback: () => Promise<T>) => Promise<T>; sleep: typeof mocks.sleep;
} };
const execute = (processCampaignContact as unknown as { handler: (context: Context) => Promise<{ status: string }> }).handler;
const context = (data: unknown = job): Context => ({ event: { id: "synthetic-job", data },
    step: { run: async (_name, callback) => callback(), sleep: mocks.sleep } });

describe("campaign worker provider boundary", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.load.mockResolvedValue(campaign);
        mocks.permission.mockResolvedValue({ allowed: true });
        mocks.reserve.mockResolvedValue(true);
        mocks.send.mockResolvedValue({ emailSent: true, smsSent: false, error: null });
        const query = { insert: mocks.insert.mockImplementation(() => query), select: () => query,
            single: async () => ({ data: { id: "request-a" }, error: null }), update: () => query,
            eq: mocks.eq.mockImplementation(() => query),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve) };
        mocks.admin.mockReturnValue({ from: () => query });
    });
    it("denies actor-less historical jobs before creating a privileged client", async () => {
        expect((await execute(context({ ...job, userId: undefined }))).status).toBe("skipped");
        expect(mocks.admin).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("denies foreign/revoked campaign access before any outbound operation", async () => {
        mocks.load.mockResolvedValue(null);
        expect((await execute(context())).status).toBe("skipped");
        expect(mocks.insert).not.toHaveBeenCalled();
        expect(mocks.reserve).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("does not write a request using a stale cached authorization", async () => {
        mocks.load.mockResolvedValueOnce(campaign).mockResolvedValue(null);
        expect((await execute(context())).status).toBe("skipped");
        expect(mocks.insert).not.toHaveBeenCalled();
        expect(mocks.permission).not.toHaveBeenCalled();
        expect(mocks.reserve).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("revalidates permission after the delay before sending", async () => {
        mocks.sleep.mockImplementation(async () => { mocks.load.mockResolvedValue(null); });
        await execute(context());
        expect(mocks.load).toHaveBeenCalledTimes(4);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.bump).not.toHaveBeenCalled();
    });
    it("rechecks opt-outs after a delay", async () => {
        mocks.sleep.mockImplementation(async () => { mocks.permission.mockResolvedValue({ allowed: false, reason: "Opted out" }); });
        await execute(context());
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("denies exhausted quota and Redis outages before provider work", async () => {
        mocks.reserve.mockResolvedValue(false);
        await execute(context());
        expect(mocks.send).not.toHaveBeenCalled();
        mocks.reserve.mockRejectedValue(new Error("Synthetic outage"));
        await expect(execute(context())).rejects.toThrow("Synthetic outage");
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("rechecks changed plan allowance at actual send time", async () => {
        mocks.sleep.mockImplementation(async () => { mocks.reserve.mockResolvedValue(false); });
        await execute(context());
        expect(mocks.reserve).toHaveBeenCalledTimes(2);
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("preserves authorized sends with an idempotent tenant-derived quota claim and scoped bookkeeping", async () => {
        expect((await execute(context())).status).toBe("completed");
        expect(mocks.reserve).toHaveBeenNthCalledWith(1, "org-a", ["email"], `${job.campaignId}:synthetic-job`);
        expect(mocks.reserve).toHaveBeenNthCalledWith(2, "org-a", ["email"], `${job.campaignId}:synthetic-job`);
        expect(mocks.send).toHaveBeenCalledTimes(1);
        expect(mocks.eq).toHaveBeenCalledWith("business_id", job.businessId);
        expect(mocks.eq).toHaveBeenCalledWith("campaign_id", job.campaignId);
        expect(mocks.bump).toHaveBeenCalledTimes(1);
    });
});
