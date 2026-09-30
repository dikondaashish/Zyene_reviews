import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), send: vi.fn(), eq: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: {
    createFunction: (config: unknown, _trigger: unknown, handler: unknown) => ({ config, handler }),
} }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/campaigns/drip-step-send", () => ({ sendDripStep: mocks.send }));
import { followUpWorker } from "@/services/inngest/sync-workers/follow-up-worker";
const campaignId = "10000000-0000-4000-8000-000000000001";
const businessId = "10000000-0000-4000-8000-000000000002";
const campaign = { id: campaignId, business_id: businessId, status: "active", follow_up_enabled: true,
    businesses: { id: businessId, organization_id: "org-a" } };
type Context = { event: { id?: string; data: { campaignId: string } }; step: {
    run: <T>(name: string, callback: () => Promise<T>) => Promise<T>;
} };
const worker = followUpWorker as unknown as { config: unknown; handler: (context: Context) => Promise<void> };
const context = (id: string | undefined = "signed-cron-a", target = campaignId): Context => ({
    event: { id, data: { campaignId: target } }, step: { run: async (_name, callback) => callback() },
});
let liveCampaign = { ...campaign };
let campaignError: Error | null = null;
let requestError: Error | null = null;
describe("signed follow-up worker scope", () => {
    beforeEach(() => {
        vi.resetAllMocks(); liveCampaign = { ...campaign }; campaignError = null; requestError = null;
        mocks.admin.mockReturnValue({ from: (table: string) => {
            const query = { select: () => query, eq: mocks.eq.mockImplementation(() => query),
                is: () => query, lt: () => query, limit: () => query,
                single: async () => ({ data: liveCampaign, error: campaignError }),
                then: (resolve: (result: unknown) => unknown) => Promise.resolve({
                    data: table === "review_requests" ? [{ id: "synthetic-request" }] : [], error: requestError,
                }).then(resolve) };
            return query;
        } });
    });
    it("denies malformed campaign identifiers before privileged access", async () => {
        await worker.handler(context("signed-cron-a", "foreign-not-uuid"));
        expect(mocks.admin).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("requires a signed event occurrence ID for quota claim identity", async () => {
        await worker.handler({ ...context(), event: { data: { campaignId } } });
        expect(mocks.admin).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
    });
    it.each(["paused", "draft"])("denies campaigns no longer %s/active", async status => {
        liveCampaign.status = status;
        await worker.handler(context()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("denies a campaign whose related business no longer matches", async () => {
        liveCampaign.businesses = { ...campaign.businesses, id: "foreign-business" };
        await worker.handler(context()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("fails closed and permits job retries on campaign or request query errors", async () => {
        campaignError = new Error("Synthetic campaign read failure");
        await expect(worker.handler(context())).rejects.toThrow("Synthetic campaign read failure");
        campaignError = null; requestError = new Error("Synthetic request read failure");
        await expect(worker.handler(context())).rejects.toThrow("Synthetic request read failure");
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("selects both phases within the exact live business and propagates the occurrence ID", async () => {
        await worker.handler(context());
        expect(mocks.eq).toHaveBeenCalledWith("status", "active");
        expect(mocks.eq.mock.calls.filter(([key]) => key === "business_id")).toEqual([
            ["business_id", businessId], ["business_id", businessId],
        ]);
        expect(mocks.send).toHaveBeenNthCalledWith(1, expect.objectContaining({ step: 2, deliveryId: "signed-cron-a" }));
        expect(mocks.send).toHaveBeenNthCalledWith(2, expect.objectContaining({ step: 3, deliveryId: "signed-cron-a" }));
        expect(worker.config).toEqual(expect.objectContaining({ concurrency: { limit: 1, key: "event.data.campaignId" } }));
    });
});
