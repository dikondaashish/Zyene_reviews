import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sms: vi.fn(), email: vi.fn(), limit: vi.fn(), admin: vi.fn(), bump: vi.fn(), inngest: vi.fn() }));
vi.mock("@/services/twilio/send-sms", () => ({ sendSMS: mocks.sms }));
vi.mock("@/services/resend/send-review-request-email", () => ({ sendReviewRequestEmail: mocks.email }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: mocks.limit }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/review-requests/bump-after-send", () => ({ bumpCustomerAfterSend: mocks.bump }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.inngest } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { runBulkReviewRequestAction } from "@/services/customers/bulk-request-action";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const customer = (id: string, lastSent: string | null, extra: Record<string, unknown> = {}) => ({
    id, business_id: BIZ, first_name: "Sam", last_name: null, phone: `+1555555${id}`, normalized_phone: `+1555555${id}`,
    is_opted_out: false, tags: [], last_request_sent_at: lastSent, ...extra,
});
let db: FakeDb;
function seed(cap: number | null, customers: ReturnType<typeof customer>[], biz: Record<string, unknown> = {}) {
    db = createFakeDb({
        businesses: [{ id: BIZ, name: "Acme", slug: "acme", timezone: "UTC", review_request_frequency_cap_days: cap,
            review_request_sms_enabled: true, review_request_email_enabled: true, review_request_quiet_hours_enabled: false,
            review_request_quiet_start: "21:00", review_request_quiet_end: "08:00", organizations: { id: "org-a", plan: "pro" }, ...biz }],
        customers, sms_opt_outs: [], review_request_email_unsubscribes: [], review_requests: [], review_request_messages: [],
    }, { review_request_messages: [["review_request_id", "step", "channel"]] });
    mocks.admin.mockReturnValue(db.client);
}

describe("bulk review requests go through the shared guard", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-tracking-secret");
        mocks.limit.mockResolvedValue({ allowed: true, remaining: 100 });
        mocks.sms.mockResolvedValue({ sent: true, sid: "SM00000000000000000000000000000001" });
    });

    it("skips customers asked within the business frequency cap, with the reason", async () => {
        seed(30, [customer("0101", daysAgo(5)), customer("0102", daysAgo(45)), customer("0103", null)]);
        const result = await runBulkReviewRequestAction(db.client, BIZ, ["0101", "0102", "0103"]);
        expect(result.status).toBe(200);
        expect(mocks.sms).toHaveBeenCalledTimes(2);
        expect(mocks.sms.mock.calls.map((call) => call[0])).not.toContain("+15555550101");
        expect(result.body).toMatchObject({ sent: 2, skipped: 1, skippedIds: ["0101"] });
        expect((result.body as { skippedReasons: Record<string, string> }).skippedReasons["0101"]).toMatch(/30 days/);
        expect(db.tables.review_requests.every((r) => typeof r.review_link === "string" && String(r.review_link).includes("ref="))).toBe(true);
    });

    it("defaults to a 30-day cap and rejects when every contact is capped", async () => {
        seed(null, [customer("0101", daysAgo(29))]);
        const result = await runBulkReviewRequestAction(db.client, BIZ, ["0101"]);
        expect(result.status).toBe(400);
        expect(mocks.sms).not.toHaveBeenCalled();
    });

    it("respects the SMS switch and STOP opt-outs", async () => {
        seed(30, [customer("0101", null)], { review_request_sms_enabled: false });
        expect((await runBulkReviewRequestAction(db.client, BIZ, ["0101"])).status).toBe(400);
        seed(30, [customer("0101", null)]);
        db.tables.sms_opt_outs.push({ id: "o1", phone_number: "+15555550101" });
        expect((await runBulkReviewRequestAction(db.client, BIZ, ["0101"])).status).toBe(400);
        expect(mocks.sms).not.toHaveBeenCalled();
    });

    it("queues instead of texting during quiet hours", async () => {
        const hour = new Date().getUTCHours();
        // Quiet window covering "now" in UTC.
        seed(30, [customer("0101", null)], {
            review_request_quiet_hours_enabled: true,
            review_request_quiet_start: `${String(hour).padStart(2, "0")}:00`, review_request_quiet_end: `${String((hour + 2) % 24).padStart(2, "0")}:00`,
        });
        const result = await runBulkReviewRequestAction(db.client, BIZ, ["0101"]);
        expect(result.body).toMatchObject({ sent: 0, queued: 1 });
        expect(mocks.sms).not.toHaveBeenCalled();
        expect(db.tables.review_requests[0]).toMatchObject({ status: "queued", deferred_reason: expect.stringContaining("quiet hours") });
        expect(mocks.inngest).toHaveBeenCalledWith(expect.objectContaining({ name: "review-request/scheduled.send" }));
    });
});
