import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: vi.fn().mockResolvedValue({ allowed: true }) }));
import { checkReviewRequestSend, isCustomerSkip } from "@/lib/review-requests/send-guard";
import { prepareOutboundReviewRequest } from "@/lib/review-requests/send-outbound-validate";
import { fail, skip } from "@/lib/review-requests/send-outbound-types";
import { outboundSendResponse } from "@/services/review-requests/api/outbound-send-response";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-0000000000aa";
const now = new Date("2026-06-15T16:00:00Z");
const business = (overrides: Record<string, unknown> = {}) => ({
    id: BIZ, name: "Cafe", slug: "cafe", email: null, sender_name: null, organization_id: null, timezone: "America/New_York",
    review_request_sms_enabled: true, review_request_email_enabled: true, review_request_frequency_cap_days: 30,
    review_request_quiet_hours_enabled: false, review_request_quiet_start: "21:00", review_request_quiet_end: "08:00",
    ...overrides,
});
const askedDaysAgo = (days: number) => ({
    business_id: BIZ, normalized_phone: "+15555550100", is_opted_out: false, tags: [],
    last_request_sent_at: new Date(Date.now() - days * 86_400_000).toISOString(),
});
let db: FakeDb;

describe("Zapier/API guard skips are not errors", () => {
    beforeEach(() => {
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-secret");
        db = createFakeDb({ businesses: [business()], customers: [], sms_opt_outs: [], review_request_email_unsubscribes: [] });
    });

    it("classifies frequency cap, opt-out and STOP as customer skips and channel-off as setup", async () => {
        db.tables.customers = [askedDaysAgo(5)];
        const capped = await checkReviewRequestSend(db.client, {
            businessId: BIZ, channels: ["sms"], phone: "+15555550100", frequencyCap: "apply", now: new Date(),
        });
        expect(capped.blocked).toEqual([{ channel: "sms", reason: "Already asked within the last 30 days", kind: "customer" }]);
        expect(isCustomerSkip(capped.blocked)).toBe(true);

        db.tables.customers = [];
        db.tables.businesses = [business({ review_request_sms_enabled: false })];
        const off = await checkReviewRequestSend(db.client, {
            businessId: BIZ, channels: ["sms"], phone: "+15555550100", frequencyCap: "apply", now,
        });
        expect(off.blocked[0].kind).toBe("setup");
        expect(isCustomerSkip(off.blocked)).toBe(false);
        expect(isCustomerSkip([])).toBe(false);
    });

    it("marks a contact asked within the cap as skipped (still code 400 for POS callers)", async () => {
        db.tables.customers = [askedDaysAgo(5)];
        const result = await prepareOutboundReviewRequest({
            admin: db.client, businessId: BIZ, channel: "sms", customerPhone: "555-555-0100",
        });
        expect(result).toMatchObject({ success: false, code: 400, skipped: true, errorMessage: "Already asked within the last 30 days" });
    });

    it("keeps a setup problem as a real 400 error", async () => {
        db.tables.businesses = [business({ review_request_sms_enabled: false })];
        const result = await prepareOutboundReviewRequest({
            admin: db.client, businessId: BIZ, channel: "sms", customerPhone: "555-555-0100",
        });
        expect(result).toMatchObject({ success: false, code: 400 });
        expect("skipped" in result && result.skipped).toBeFalsy();
    });

    it("answers a skip with 200 status skipped and real failures with their code", async () => {
        const skipped = outboundSendResponse(skip("sms", "Already asked within the last 30 days"));
        expect(skipped.status).toBe(200);
        expect(await skipped.json()).toEqual({
            success: true,
            data: { requestId: null, status: "skipped", channel: "sms", reason: "not_eligible", message: "Already asked within the last 30 days" },
        });

        const failed = outboundSendResponse(fail(403, "sms", "Monthly limit reached"));
        expect(failed.status).toBe(403);
        expect(await failed.json()).toEqual({ success: false, error: "Monthly limit reached" });

        const sent = outboundSendResponse({
            success: true, requestId: "r1", status: "sent", channel: "sms", reviewLink: "https://x.test/cafe", errorMessage: null,
        });
        expect(sent.status).toBe(200);
        expect((await sent.json()).data).toMatchObject({ requestId: "r1", status: "sent" });
    });
});
