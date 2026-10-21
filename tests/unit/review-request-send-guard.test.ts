import { beforeEach, describe, expect, it, vi } from "vitest";
const providers = vi.hoisted(() => ({ sms: vi.fn(), email: vi.fn() }));
vi.mock("@/services/twilio/send-sms", () => ({ sendSMS: providers.sms }));
vi.mock("@/services/resend/send-review-request-email", () => ({ sendReviewRequestEmail: providers.email }));
import { checkReviewRequestSend } from "@/lib/review-requests/send-guard";
import { dispatchReviewRequest } from "@/lib/review-requests/dispatch-review-request";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const OTHER_BIZ = "30000000-0000-4000-8000-000000000002";
const business = (overrides: Record<string, unknown> = {}) => ({
    id: BIZ, timezone: "America/New_York", review_request_sms_enabled: true, review_request_email_enabled: true,
    review_request_frequency_cap_days: 30, review_request_quiet_hours_enabled: false, review_request_quiet_start: "21:00",
    review_request_quiet_end: "08:00", ...overrides,
});
let db: FakeDb;
const noon = new Date("2026-06-15T16:00:00Z"); // 12:00 in New York
const guard = (input: Partial<Parameters<typeof checkReviewRequestSend>[1]> = {}) => checkReviewRequestSend(db.client, {
    businessId: BIZ, channels: ["sms", "email"], phone: "+15555550100", email: "sam@example.test", frequencyCap: "apply", now: noon, ...input,
});

describe("shared review-request send guard", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-secret");
        db = createFakeDb({ businesses: [business()], customers: [], sms_opt_outs: [], review_request_email_unsubscribes: [], review_request_messages: [] },
            { review_request_messages: [["review_request_id", "step", "channel"]] });
        providers.sms.mockResolvedValue({ sent: true, sid: "SM00000000000000000000000000000001" });
        providers.email.mockResolvedValue({ sent: true, id: "email-1" });
    });

    it("allows both channels for an eligible contact", async () => {
        expect(await guard()).toMatchObject({ allowed: ["sms", "email"], blocked: [], deferUntil: null });
    });

    it("enforces the business SMS and Email switches", async () => {
        db.tables.businesses = [business({ review_request_sms_enabled: false })];
        expect(await guard()).toMatchObject({ allowed: ["email"], blocked: [{ channel: "sms", reason: expect.stringContaining("turned off") }] });
        db.tables.businesses = [business({ review_request_email_enabled: false, review_request_sms_enabled: false })];
        expect((await guard()).allowed).toEqual([]);
    });

    it("blocks SMS after STOP (raw or normalized number) and email after an unsubscribe for this business only", async () => {
        // The live sms_opt_outs table has only phone_number + opted_out_at (no id column).
        db.tables.sms_opt_outs.push({ phone_number: "+15555550100", opted_out_at: "2026-01-01T00:00:00Z" });
        db.tables.review_request_email_unsubscribes.push({ id: "u1", business_id: BIZ, email: "sam@example.test" });
        expect((await guard({ phone: "(555) 555-0100" })).allowed).toEqual([]);
        db.tables.review_request_email_unsubscribes = [{ id: "u2", business_id: OTHER_BIZ, email: "sam@example.test" }];
        expect((await guard({ channels: ["email"] })).allowed).toEqual(["email"]);
    });

    it("applies customer opt-out, test tags and the frequency cap via normalized identity", async () => {
        db.tables.customers.push({ business_id: BIZ, normalized_email: "sam@example.test", is_opted_out: true, tags: [], last_request_sent_at: null });
        expect((await guard({ email: "SAM@example.test ", channels: ["email"] })).blocked[0].reason).toMatch(/opted out/);
        db.tables.customers = [{ business_id: BIZ, normalized_phone: "+15555550100", is_opted_out: false, tags: ["zyene:test"], last_request_sent_at: null }];
        expect((await guard({ channels: ["sms"] })).blocked[0].reason).toBe("Test contact");
        db.tables.customers = [{ business_id: BIZ, normalized_phone: "+15555550100", is_opted_out: false, tags: [],
            last_request_sent_at: new Date(noon.getTime() - 5 * 86_400_000).toISOString() }];
        expect((await guard({ channels: ["sms"] })).blocked[0].reason).toMatch(/30 days/);
        expect((await guard({ channels: ["sms"], frequencyCap: "skip" })).allowed).toEqual(["sms"]);
        // Another business's customer record never affects this business.
        db.tables.customers = [{ business_id: OTHER_BIZ, normalized_phone: "+15555550100", is_opted_out: true, tags: [] }];
        expect((await guard({ channels: ["sms"] })).allowed).toEqual(["sms"]);
    });

    it("defers during quiet hours in the business timezone", async () => {
        db.tables.businesses = [business({ review_request_quiet_hours_enabled: true })];
        const late = new Date("2026-06-16T03:00:00Z"); // 23:00 New York
        expect((await guard({ now: late })).deferUntil?.toISOString()).toBe("2026-06-16T12:00:00.000Z");
    });
});

describe("guarded dispatch: one send per message", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-secret");
        db = createFakeDb({ businesses: [business()], customers: [], sms_opt_outs: [], review_request_email_unsubscribes: [], review_request_messages: [], review_requests: [] },
            { review_request_messages: [["review_request_id", "step", "channel"]] });
        providers.sms.mockResolvedValue({ sent: true, sid: "SM00000000000000000000000000000001" });
        providers.email.mockResolvedValue({ sent: true, id: "email-1" });
    });
    const input = {
        requestId: "40000000-0000-4000-8000-000000000001", businessId: BIZ, step: 1 as const, channels: ["sms", "email"] as ("sms" | "email")[],
        phone: "+15555550100", email: "sam@example.test", frequencyCap: "apply" as const, now: noon,
        sms: { body: "Hi" }, emailMessage: { subject: "S", html: "<html><body><p>Hi</p></body></html>" }, businessName: "Acme",
    };

    it("sends each channel once, records provider ids, and adds a signed unsubscribe link to email", async () => {
        const result = await dispatchReviewRequest(db.client, input);
        expect(result).toMatchObject({ sendStatus: "sent", smsLegStatus: "sent", emailLegStatus: "sent" });
        expect(db.tables.review_request_messages.map((m) => [m.channel, m.status, m.provider_message_id])).toEqual([
            ["sms", "sent", "SM00000000000000000000000000000001"], ["email", "sent", "email-1"]]);
        const email = providers.email.mock.calls[0][0];
        expect(email.unsubscribeUrl).toMatch(/\/api\/review-requests\/unsubscribe\?ref=40000000-0000-4000-8000-000000000001&sig=/);
        expect(email.html).toContain("Unsubscribe</a>");
        expect(email.idempotencyKey).toBe("review-request/40000000-0000-4000-8000-000000000001/step-1");
    });

    it("never resends on a retry or an overlapping worker", async () => {
        await dispatchReviewRequest(db.client, input);
        const retry = await dispatchReviewRequest(db.client, input);
        expect(providers.sms).toHaveBeenCalledTimes(1);
        expect(providers.email).toHaveBeenCalledTimes(1);
        expect(retry).toMatchObject({ sendStatus: "sent", errorMessage: expect.stringContaining("not resent") });
    });

    it("does not resend a message whose earlier attempt is still in flight", async () => {
        db.tables.review_request_messages.push({ id: "m0", review_request_id: input.requestId, step: 1, channel: "sms", status: "claimed" });
        const result = await dispatchReviewRequest(db.client, { ...input, channels: ["sms"] });
        expect(providers.sms).not.toHaveBeenCalled();
        expect(result.sendStatus).toBe("skipped");
    });

    it("retries a message that failed before reaching the provider", async () => {
        providers.sms.mockResolvedValueOnce({ sent: false, error: "Twilio down" });
        expect((await dispatchReviewRequest(db.client, { ...input, channels: ["sms"] })).sendStatus).toBe("failed");
        expect((await dispatchReviewRequest(db.client, { ...input, channels: ["sms"] })).sendStatus).toBe("sent");
        expect(providers.sms).toHaveBeenCalledTimes(2);
    });

    it("skips with a readable reason and calls no provider when every channel is blocked", async () => {
        db.tables.businesses = [business({ review_request_sms_enabled: false, review_request_email_enabled: false })];
        const result = await dispatchReviewRequest(db.client, input);
        expect(result).toMatchObject({ sendStatus: "skipped", smsLegStatus: "skipped", emailLegStatus: "skipped" });
        expect(result.errorMessage).toMatch(/SMS review requests are turned off/);
        expect(providers.sms).not.toHaveBeenCalled();
        expect(providers.email).not.toHaveBeenCalled();
    });

    it("returns deferred (and sends nothing) during quiet hours", async () => {
        db.tables.businesses = [business({ review_request_quiet_hours_enabled: true })];
        const result = await dispatchReviewRequest(db.client, { ...input, now: new Date("2026-06-16T03:00:00Z") });
        expect(result.sendStatus).toBe("deferred");
        expect(providers.sms).not.toHaveBeenCalled();
    });
});
