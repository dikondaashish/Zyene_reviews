import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), createAdminClient: vi.fn(), access: vi.fn(), limit: vi.fn(), send: vi.fn(), quota: vi.fn(), adminEq: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/auth/rate-limit", () => ({ campaignRateLimit: { limit: mocks.limit } }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/services/campaigns/campaign-send-quota", () => ({ checkCampaignAudienceQuota: mocks.quota }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { handleCampaignSend } from "@/services/campaigns/campaign-send-api";
const campaignId = "11111111-1111-4111-8111-111111111111";
const customerId = "22222222-2222-4222-8222-222222222222";
let attempts: Array<{ customer_phone?: string | null; customer_email?: string | null }> = [];
let campaignQuery: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; maybeSingle: ReturnType<typeof vi.fn> };
function request() { return new Request("https://example.test/send", { method: "POST", body: JSON.stringify({ customerIds: [customerId] }) }); }

beforeEach(() => {
    vi.clearAllMocks();
    campaignQuery = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    campaignQuery.select.mockReturnValue(campaignQuery); campaignQuery.eq.mockReturnValue(campaignQuery);
    campaignQuery.maybeSingle.mockResolvedValue({ data: { id: campaignId, business_id: "business", status: "active", channel: "sms" } });
    const customers = { select: vi.fn(), eq: vi.fn(), in: vi.fn() };
    customers.select.mockReturnValue(customers); customers.eq.mockReturnValue(customers);
    customers.in.mockResolvedValue({ data: [{ id: customerId, first_name: "Test", last_name: null, phone: "(555) 123-4567", email: null, is_opted_out: false }], error: null });
    mocks.createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user", email_confirmed_at: "2026-01-01" } } }) }, from: vi.fn((table: string) => table === "campaigns" ? campaignQuery : customers) });
    const adminQuery = { update: vi.fn(), eq: mocks.adminEq,
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve) };
    adminQuery.update.mockReturnValue(adminQuery); mocks.adminEq.mockReturnValue(adminQuery);
    attempts = [];
    const attemptsQuery = { select: vi.fn(), eq: vi.fn(), in: vi.fn(), limit: vi.fn() };
    attemptsQuery.select.mockReturnValue(attemptsQuery); attemptsQuery.eq.mockReturnValue(attemptsQuery);
    attemptsQuery.in.mockReturnValue(attemptsQuery);
    attemptsQuery.limit.mockImplementation(async () => ({ data: attempts, error: null }));
    const adminFrom = vi.fn((table: string) => (table === "review_requests" ? attemptsQuery : adminQuery));
    mocks.createAdminClient.mockReturnValue({ from: adminFrom });
    mocks.access.mockResolvedValue(true); mocks.limit.mockResolvedValue({ success: true }); mocks.send.mockResolvedValue({ ids: ["event"] });
    mocks.quota.mockResolvedValue(true);
});

describe("selected campaign sending", () => {
    it("returns actual queued counts in the public API envelope and stable recipient event IDs", async () => {
        const response = await handleCampaignSend(request(), campaignId);
        expect(await response.json()).toMatchObject({ success: true, data: { queuedCount: 1, skippedCount: 0 } });
        expect(mocks.send).toHaveBeenCalledWith([expect.objectContaining({ id: `campaign:${campaignId}:contact:+15551234567:attempt:0`, data: expect.objectContaining({ businessId: "business", contact: expect.objectContaining({ phone: "+15551234567" }) }) })]);
        // Sending keeps the campaign "active" so the follow-up cron still picks it up.
        expect(mocks.createAdminClient().from).not.toHaveBeenCalledWith("campaigns");
    });
    it("accepts a legacy processing campaign and moves it back to active", async () => {
        campaignQuery.maybeSingle.mockResolvedValue({ data: { id: campaignId, business_id: "business", status: "processing", channel: "sms" } });
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(200);
        const adminFrom = mocks.createAdminClient().from;
        expect(adminFrom).toHaveBeenCalledWith("campaigns");
        expect(adminFrom().update).toHaveBeenCalledWith({ status: "active" });
        expect(mocks.adminEq).toHaveBeenCalledWith("business_id", "business");
    });
    it.each(["draft", "paused", "completed"])("rejects a %s campaign before enqueuing", async (status) => {
        campaignQuery.maybeSingle.mockResolvedValue({ data: { id: campaignId, business_id: "business", status, channel: "sms" } });
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(400);
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("never enqueues for an unauthorized business", async () => {
        mocks.access.mockResolvedValue(false);
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(403);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
        expect(mocks.quota).not.toHaveBeenCalled();
    });
    it("requires writable business access and binds the authenticated actor to every job", async () => {
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(200);
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), "user", "business", true);
        expect(mocks.send).toHaveBeenCalledWith([expect.objectContaining({ data: expect.objectContaining({ userId: "user" }) })]);
    });
    it("denies an audience over the channel allowance before enqueuing or privileged writes", async () => {
        mocks.quota.mockResolvedValue(false);
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(403);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });
    it("reports a queue failure as a failure", async () => {
        mocks.send.mockRejectedValue(new Error("unavailable"));
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(500);
    });
    it("normalizes typed phone numbers before they reach Twilio or the duplicate check", async () => {
        const manual = new Request("https://example.test/send", { method: "POST", body: JSON.stringify({
            contacts: [{ name: " Ann ", phone: "555-987-6543" }, { phone: "(555) 987-6543" }, { phone: "12" }],
        }) });
        const response = await handleCampaignSend(manual, campaignId);
        expect(await response.json()).toMatchObject({ data: { queuedCount: 2, skippedCount: 1 } });
        const events = mocks.send.mock.calls[0][0] as Array<{ id: string; data: { contact: { phone?: string; name?: string } } }>;
        expect(events.map((e) => e.data.contact.phone)).toEqual(["+15559876543", "+15559876543"]);
        expect(events[0].data.contact.name).toBe("Ann");
        // The same person typed twice gets one id, so Inngest queues them once.
        expect(events[0].id).toBe(events[1].id);
    });
    it("gives a deliberate re-send after a skipped attempt a new event id", async () => {
        attempts = [{ customer_phone: "+15551234567" }];
        await handleCampaignSend(request(), campaignId);
        expect(mocks.send).toHaveBeenCalledWith([expect.objectContaining({ id: `campaign:${campaignId}:contact:+15551234567:attempt:1` })]);
    });
    it("explains when no contact has an email for an email campaign instead of queuing nothing", async () => {
        campaignQuery.maybeSingle.mockResolvedValue({ data: { id: campaignId, business_id: "business", status: "active", channel: "email" } });
        const manual = new Request("https://example.test/send", { method: "POST", body: JSON.stringify({ contacts: [{ phone: "5551234567" }] }) });
        const response = await handleCampaignSend(manual, campaignId);
        expect(response.status).toBe(400);
        expect((await response.json()).error).toMatch(/email/i);
        expect(mocks.send).not.toHaveBeenCalled();
    });
});
