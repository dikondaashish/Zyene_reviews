import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), update: vi.fn(), eq: vi.fn(), insert: vi.fn(), limit: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ from: () => {
    const query = { select: () => query, eq: mocks.eq, is: () => query, in: () => query,
        maybeSingle: mocks.lookup, update: mocks.update, insert: mocks.insert, limit: mocks.limit,
        then: (resolve: (value: unknown) => void) => Promise.resolve({ error: null }).then(resolve) };
    mocks.eq.mockImplementation(() => query); mocks.update.mockImplementation(() => query);
    return query;
} }) }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send, createFunction: (_c: unknown, _e: unknown, handler: unknown) => handler } }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.send }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { GET, POST } from "@/app/api/marketing/product-email/unsubscribe/route";
import { activeGrowthEmailPreferences } from "@/lib/growth/growth-email-preferences";
import { trialNurtureWorker } from "@/services/inngest/growth-functions";
import { scheduleTrialNurture } from "@/lib/growth/schedule-growth-emails";

const id = "9ea3634a-3e04-4d62-bf87-4f1d48d41bdc";
const url = `https://www.zyenereviews.com/api/marketing/product-email/unsubscribe?id=${id}`;
const post = () => new Request(url, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" });
beforeEach(() => { vi.clearAllMocks(); mocks.lookup.mockResolvedValue({ data: { id, status: "active", recipient_email: "alex@example.test" }, error: null }); });

describe("product email preferences", () => {
    it("returns an opaque opt-out URL scoped to the registered organization and recipient", async () => {
        const result = await activeGrowthEmailPreferences("trial_nurture", "ALEX@example.test", "org-fixture");
        expect(result?.unsubscribeUrl).toContain(id);
        expect(result?.unsubscribeUrl).not.toContain("alex@");
        expect(mocks.eq).toHaveBeenCalledWith("recipient_email", "alex@example.test");
        expect(mocks.eq).toHaveBeenCalledWith("organization_id", "org-fixture");
    });
    it.each([null, { id, status: "canceled" }, { id, status: "completed" }])("sends no tips for inactive or absent runs", async data => {
        mocks.lookup.mockResolvedValue({ data, error: null });
        expect(await activeGrowthEmailPreferences("winback", "alex@example.test")).toBeNull();
    });
    it("fails closed if the preference lookup is unavailable", async () => {
        mocks.lookup.mockResolvedValue({ data: null, error: { message: "unavailable" } });
        await expect(activeGrowthEmailPreferences("winback", "alex@example.test")).rejects.toThrow();
    });
    it("GET shows a branded confirmation without changing preferences", async () => {
        const response = await GET(new Request(url));
        expect(await response.text()).toContain("28 Geary");
        expect(mocks.update).not.toHaveBeenCalled();
        expect(response.headers.get("x-robots-tag")).toBe("noindex");
    });
    it("one-click cancels product sequences without returning the recipient's email", async () => {
        const response = await POST(post());
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ unsubscribed: true });
        expect(mocks.update).toHaveBeenCalledWith({ status: "canceled" });
        expect(mocks.eq).toHaveBeenCalledWith("recipient_email", "alex@example.test");
    });
    it("rejects malformed tokens without an update", async () => {
        const request = post();
        expect((await POST(new Request(url.replace(id, "invalid"), request))).status).toBe(400);
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it("does not register a new sequence after a recipient opted out", async () => {
        mocks.limit.mockResolvedValue({ data: [{ id }], error: null });
        await scheduleTrialNurture({ email: "alex@example.test", userName: "Alex" });
        expect(mocks.insert).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("checks preferences after every delay and preserves cancellation at completion", async () => {
        mocks.lookup.mockResolvedValueOnce({ data: { id, status: "active" }, error: null })
            .mockResolvedValue({ data: { id, status: "canceled" }, error: null });
        const run = trialNurtureWorker as unknown as (args: { event: { data: { email: string; userName: string; dashboardUrl: string } }; step: { sleep: () => Promise<void>; run: (key: string, fn: () => Promise<void>) => Promise<void> } }) => Promise<void>;
        await run({ event: { data: { email: "alex@example.test", userName: "Alex", dashboardUrl: "https://app.zyenereviews.com/dashboard" } },
            step: { sleep: async () => {}, run: async (_key, fn) => fn() } });
        expect(mocks.send).toHaveBeenCalledTimes(1);
        expect(mocks.send.mock.calls[0][0].unsubscribeUrl).toContain(id);
        expect(mocks.eq).toHaveBeenCalledWith("status", "active");
    });
});
