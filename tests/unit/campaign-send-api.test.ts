import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), createAdminClient: vi.fn(), access: vi.fn(), limit: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/auth/rate-limit", () => ({ campaignRateLimit: { limit: mocks.limit } }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { handleCampaignSend } from "@/services/campaigns/campaign-send-api";
const campaignId = "11111111-1111-4111-8111-111111111111";
const customerId = "22222222-2222-4222-8222-222222222222";
let campaignQuery: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; maybeSingle: ReturnType<typeof vi.fn> };
function request() { return new Request("https://example.test/send", { method: "POST", body: JSON.stringify({ customerIds: [customerId] }) }); }

beforeEach(() => {
    vi.clearAllMocks();
    campaignQuery = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    campaignQuery.select.mockReturnValue(campaignQuery); campaignQuery.eq.mockReturnValue(campaignQuery);
    campaignQuery.maybeSingle.mockResolvedValue({ data: { id: campaignId, business_id: "business", status: "active", channel: "sms" } });
    const customers = { select: vi.fn(), eq: vi.fn(), in: vi.fn() };
    customers.select.mockReturnValue(customers); customers.eq.mockReturnValue(customers);
    customers.in.mockResolvedValue({ data: [{ id: customerId, first_name: "Test", last_name: null, phone: "123", email: null, is_opted_out: false }], error: null });
    mocks.createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user", email_confirmed_at: "2026-01-01" } } }) }, from: vi.fn((table: string) => table === "campaigns" ? campaignQuery : customers) });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn().mockReturnValue({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }) });
    mocks.access.mockResolvedValue(true); mocks.limit.mockResolvedValue({ success: true }); mocks.send.mockResolvedValue({ ids: ["event"] });
});

describe("selected campaign sending", () => {
    it("returns actual queued counts in the public API envelope and stable recipient event IDs", async () => {
        const response = await handleCampaignSend(request(), campaignId);
        expect(await response.json()).toMatchObject({ success: true, data: { queuedCount: 1, skippedCount: 0 } });
        expect(mocks.send).toHaveBeenCalledWith([expect.objectContaining({ id: `campaign:${campaignId}:customer:${customerId}`, data: expect.objectContaining({ businessId: "business", contact: expect.objectContaining({ phone: "123" }) }) })]);
    });
    it("never enqueues for an unauthorized business", async () => {
        mocks.access.mockResolvedValue(false);
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(403);
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("reports a queue failure as a failure", async () => {
        mocks.send.mockRejectedValue(new Error("unavailable"));
        expect((await handleCampaignSend(request(), campaignId)).status).toBe(500);
    });
});
