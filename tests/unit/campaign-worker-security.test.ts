import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), load: vi.fn(), eligibility: vi.fn(), reserve: vi.fn(),
    send: vi.fn(), bump: vi.fn(), eq: vi.fn(), sleep: vi.fn(), sleepUntil: vi.fn(), insert: vi.fn(), update: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_config: unknown, _trigger: unknown, handler: unknown) => ({ handler }) } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/campaigns/campaign-job-access", async importOriginal => ({
    ...await importOriginal<typeof import("@/services/campaigns/campaign-job-access")>(),
    loadAuthorizedCampaignJob: mocks.load,
}));
vi.mock("@/services/campaigns/campaign-contact-steps", () => ({
    campaignContactEligibility: mocks.eligibility, campaignNotActiveReason: () => "Campaign is paused, archived or no longer accessible",
}));
vi.mock("@/lib/stripe/reserve-channel-usage", () => ({ reserveChannelUsage: mocks.reserve }));
vi.mock("@/lib/notifications/review-request", () => ({ sendReviewRequest: mocks.send }));
vi.mock("@/lib/review-requests/bump-after-send", () => ({ bumpCustomerAfterSend: mocks.bump }));
import { processCampaignContact } from "@/services/inngest/functions/process-campaign-contact-function";
const job = { campaignId: "10000000-0000-4000-8000-000000000001", businessId: "10000000-0000-4000-8000-000000000002",
    userId: "10000000-0000-4000-8000-000000000003", contact: { email: "synthetic@example.test" } };
const campaign = { channel: "email", delay_minutes: 60, follow_up_enabled: true, sms_template: null, email_template: null,
    businesses: { organization_id: "org-a", name: "Synthetic business", slug: "synthetic-business", sender_name: null,
        timezone: "America/New_York", review_request_frequency_cap_days: 30 } };
const sent = { sendStatus: "sent", errorMessage: null, deferUntil: null, reviewLink: "https://capture.test/x?ref=request-a",
    smsLegStatus: null, emailLegStatus: "sent" };
type Context = { event: { id: string; data: unknown }; step: {
    run: <T>(name: string, callback: () => Promise<T>) => Promise<T>; sleep: typeof mocks.sleep; sleepUntil: typeof mocks.sleepUntil;
} };
const execute = (processCampaignContact as unknown as { handler: (context: Context) => Promise<{ status: string }> }).handler;
const context = (data: unknown = job): Context => ({ event: { id: "synthetic-job", data },
    step: { run: async (_name, callback) => callback(), sleep: mocks.sleep, sleepUntil: mocks.sleepUntil } });

describe("campaign worker provider boundary", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.load.mockResolvedValue(campaign);
        mocks.eligibility.mockResolvedValue({ allowed: true, channels: ["email"], reason: null });
        mocks.reserve.mockResolvedValue(true);
        mocks.send.mockResolvedValue(sent);
        const query = { insert: mocks.insert.mockImplementation(() => query), select: () => query,
            single: async () => ({ data: { id: "request-a" }, error: null }), update: mocks.update.mockImplementation(() => query),
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
        expect(mocks.eligibility).not.toHaveBeenCalled();
        expect(mocks.reserve).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("revalidates campaign access after the delay before sending (paused / archived campaigns stop)", async () => {
        mocks.sleep.mockImplementation(async () => { mocks.load.mockResolvedValue(null); });
        await execute(context());
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ status: "skipped", error_message: expect.stringContaining("paused") }));
        expect(mocks.bump).not.toHaveBeenCalled();
    });
    it("records an ineligible contact as skipped with the reason and never sends", async () => {
        mocks.eligibility.mockResolvedValue({ allowed: false, channels: [], reason: "Already requested in this campaign" });
        expect((await execute(context())).status).toBe("skipped");
        expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "skipped", error_message: "Already requested in this campaign", trigger_source: "campaign" }));
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
    it("sends only eligible channels with each channel's own template, subject and a signed link", async () => {
        mocks.load.mockResolvedValue({ ...campaign, channel: "both", sms_template: "SMS {review_link}",
            email_subject: "Thanks, {customer_name}", email_template: "<p>Email {review_link}</p>" });
        // SMS is blocked (e.g. switched off); only email is eligible.
        mocks.eligibility.mockResolvedValue({ allowed: true, channels: ["email"], reason: null });
        await execute(context({ ...job, contact: { email: "synthetic@example.test", phone: "+15555550100" } }));
        expect(mocks.send).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            requestId: "request-a", businessSlug: "synthetic-business", contactMethods: ["email"], step: 1,
            smsTemplate: "SMS {review_link}", emailTemplate: "<p>Email {review_link}</p>", emailSubject: "Thanks, {customer_name}",
        }));
        expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
            status: "sent", review_link: "https://capture.test/x?ref=request-a", email_status: "sent", drip_status: "active",
        }));
    });
    it("waits through quiet hours with a top-level sleep and then sends", async () => {
        mocks.send.mockResolvedValueOnce({ ...sent, sendStatus: "deferred", deferUntil: new Date("2030-01-01T13:00:00Z") });
        expect((await execute(context())).status).toBe("completed");
        expect(mocks.sleepUntil).toHaveBeenCalledWith("quiet-hours-1", new Date("2030-01-01T13:00:00Z"));
        expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ status: "queued", deferred_reason: expect.stringContaining("quiet hours") }));
        expect(mocks.send).toHaveBeenCalledTimes(2);
    });
    it("fails the send without a provider call when the business has no review page slug", async () => {
        mocks.load.mockResolvedValue({ ...campaign, businesses: { ...campaign.businesses, slug: null } });
        expect((await execute(context())).status).toBe("completed_with_error");
        expect(mocks.send).not.toHaveBeenCalled();
    });
});
