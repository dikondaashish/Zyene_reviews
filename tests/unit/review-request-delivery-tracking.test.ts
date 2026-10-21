import { beforeEach, describe, expect, it, vi } from "vitest";
import twilio from "twilio";
const mocks = vi.hoisted(() => ({ admin: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
import { handleTwilioStatusCallback } from "@/services/webhooks/twilio-status";
import { applyResendFact } from "@/services/webhooks/resend-delivery-apply";
import { signUnsubscribe, unsubscribeUrl, verifyUnsubscribe } from "@/lib/review-requests/unsubscribe-token";
import { signReviewTracking } from "@/lib/review-requests/tracking-token";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const REQ = "40000000-0000-4000-8000-000000000001";
const SID = "SM0123456789abcdef0123456789abcdef";
const url = "https://app.zyenereviews.test/api/webhooks/twilio/status";
const token = "test-auth-token";
let db: FakeDb;

function twilioRequest(params: Record<string, string>, signed = true) {
    return new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded",
            ...(signed ? { "x-twilio-signature": twilio.getExpectedTwilioSignature(token, url, params) } : {}) },
        body: new URLSearchParams(params),
    });
}

beforeEach(() => {
    vi.stubEnv("TWILIO_AUTH_TOKEN", token);
    vi.stubEnv("TWILIO_STATUS_CALLBACK_URL", url);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-secret");
    db = createFakeDb({
        review_requests: [{ id: REQ, business_id: BIZ, channel: "sms", status: "sent", sms_status: "sent", email_status: null, customer_email: "Sam@Example.test" }],
        review_request_messages: [
            { id: "m1", review_request_id: REQ, business_id: BIZ, step: 1, channel: "sms", status: "sent", status_rank: 1, provider_message_id: SID },
            { id: "m2", review_request_id: REQ, business_id: BIZ, step: 1, channel: "email", status: "sent", status_rank: 1, provider_message_id: "email-1" },
        ],
        review_request_email_unsubscribes: [],
    }, { review_request_email_unsubscribes: [["business_id", "email"]] });
    mocks.admin.mockReturnValue(db.client);
});

describe("Twilio delivery callbacks", () => {
    it("rejects unsigned or tampered callbacks before touching data", async () => {
        expect((await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "delivered" }, false))).status).toBe(401);
        const forged = twilioRequest({ MessageSid: SID, MessageStatus: "delivered" });
        const body = new URLSearchParams({ MessageSid: SID, MessageStatus: "failed" });
        const tampered = new Request(url, { method: "POST", headers: forged.headers, body });
        expect((await handleTwilioStatusCallback(tampered)).status).toBe(401);
        expect(db.tables.review_request_messages[0].status).toBe("sent");
    });

    it("records delivered on the message and the request, distinct from sent", async () => {
        expect((await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "delivered" }))).status).toBe(204);
        expect(db.tables.review_request_messages[0]).toMatchObject({ status: "delivered", delivered_at: expect.any(String) });
        expect(db.tables.review_requests[0]).toMatchObject({ sms_status: "delivered", status: "delivered" });
    });

    it("ignores duplicate and out-of-order callbacks", async () => {
        await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "delivered" }));
        await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "sent" }));
        await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "delivered" }));
        expect(db.tables.review_request_messages[0].status).toBe("delivered");
    });

    it("records undelivered with a carrier reason and never undoes a click", async () => {
        db.tables.review_requests[0].status = "clicked";
        await handleTwilioStatusCallback(twilioRequest({ MessageSid: SID, MessageStatus: "undelivered", ErrorCode: "30007" }));
        expect(db.tables.review_request_messages[0]).toMatchObject({ status: "undelivered", reason: "Carrier error 30007" });
        expect(db.tables.review_requests[0]).toMatchObject({ status: "clicked", sms_status: "undelivered" });
    });
});

describe("Resend delivery events", () => {
    it("moves request status forward only", async () => {
        db.tables.review_requests[0] = { ...db.tables.review_requests[0], channel: "email", status: "completed", email_status: "sent" };
        await applyResendFact(db.client, { emailId: "email-1", fact: "delivered" });
        await applyResendFact(db.client, { emailId: "email-1", fact: "clicked" });
        expect(db.tables.review_requests[0]).toMatchObject({ status: "completed", email_status: "delivered", clicked_at: expect.any(String) });
    });

    it("suppresses future email after a hard bounce or spam complaint, for this business", async () => {
        db.tables.review_requests[0] = { ...db.tables.review_requests[0], channel: "email" };
        await applyResendFact(db.client, { emailId: "email-1", fact: "bounced", data: { bounce: { type: "Permanent", message: "No such user" } } });
        expect(db.tables.review_request_email_unsubscribes).toEqual([expect.objectContaining({ business_id: BIZ, email: "sam@example.test", source: "bounce" })]);
        expect(db.tables.review_requests[0]).toMatchObject({ status: "failed", email_status: "bounced" });
    });

    it("does not suppress after a soft bounce", async () => {
        await applyResendFact(db.client, { emailId: "email-1", fact: "bounced", data: { bounce: { type: "Transient" } } });
        expect(db.tables.review_request_email_unsubscribes).toEqual([]);
    });
});

describe("signed unsubscribe links", () => {
    it("verify only for the exact request and business", () => {
        const sig = signUnsubscribe(REQ, BIZ);
        expect(verifyUnsubscribe(REQ, BIZ, sig)).toBe(true);
        expect(verifyUnsubscribe("40000000-0000-4000-8000-000000000002", BIZ, sig)).toBe(false);
        expect(verifyUnsubscribe(REQ, "30000000-0000-4000-8000-000000000002", sig)).toBe(false);
        expect(verifyUnsubscribe(REQ, BIZ, `${sig.slice(0, -1)}A`)).toBe(sig.endsWith("A"));
    });

    it("cannot be forged from a review-link tracking signature", () => {
        expect(verifyUnsubscribe(REQ, BIZ, signReviewTracking(REQ, BIZ))).toBe(false);
    });

    it("carries no email address in the URL", () => {
        expect(unsubscribeUrl(REQ, BIZ)).not.toMatch(/@|example/);
    });
});
