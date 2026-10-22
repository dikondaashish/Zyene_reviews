import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock("@/lib/review-requests/dispatch-review-request", () => ({ dispatchReviewRequest: mocks.dispatch }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { renderCampaignSubject, sendReviewRequest } from "@/lib/notifications/review-request";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";
import type { SupabaseClient } from "@supabase/supabase-js";

const admin = {} as SupabaseClient;
const base = { requestId: "request-a", businessId: "business-a", businessSlug: "acme-dental", businessName: "Acme Dental",
    customerName: "Sam", customerEmail: "synthetic@example.test", customerPhone: "+15555550100" };
const dispatched = () => mocks.dispatch.mock.calls[0][1];

describe("campaign / drip review request sender", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-tracking-secret");
        vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "zyenereviews.test");
        vi.stubEnv("NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN", "capture.test");
        mocks.dispatch.mockResolvedValue({ sendStatus: "sent", deferUntil: null, errorMessage: null, resendEmailId: null, smsLegStatus: "sent", emailLegStatus: null });
    });

    it("links to the public review page with a signed per-request ref, not /review/{businessId}", async () => {
        const result = await sendReviewRequest(admin, { ...base, contactMethods: ["sms"], smsTemplate: "Hi {customer_name}: {review_link}" });
        const url = new URL(result.reviewLink!);
        expect(`${url.origin}${url.pathname}`).toBe("https://capture.test/acme-dental");
        expect(url.searchParams.get("ref")).toBe("request-a");
        expect(verifyReviewTracking("request-a", "business-a", url.searchParams.get("sig"))).toBe(true);
        expect(verifyReviewTracking("request-b", "business-a", url.searchParams.get("sig"))).toBe(false);
        expect(verifyReviewTracking("request-a", "business-b", url.searchParams.get("sig"))).toBe(false);
        expect(dispatched().sms.body).toBe(`Hi Sam: ${result.reviewLink}`);
        expect(result.smsSent).toBe(true);
    });

    it("uses the SMS template for SMS and the email template and subject for email", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["sms", "email"], smsTemplate: "Text {review_link}",
            emailTemplate: "<p>Hello {customer_name}, <a href=\"{review_link}\">review</a></p>", emailSubject: "Thanks {customer_name}" });
        const input = dispatched();
        expect(input.channels).toEqual(["sms", "email"]);
        expect(input.sms.body).toMatch(/^Text https:\/\/capture\.test\/acme-dental\?ref=request-a/);
        expect(input.emailMessage.subject).toBe("Thanks Sam");
        expect(input.emailMessage.html).toContain("Hello Sam");
        expect(input.emailMessage.html).not.toContain("Text ");
    });

    it("applies the frequency cap to first messages but not to reminders of the same request", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["email"] });
        expect(dispatched()).toMatchObject({ step: 1, frequencyCap: "apply" });
        mocks.dispatch.mockClear();
        await sendReviewRequest(admin, { ...base, contactMethods: ["email"], isFollowUp: true, step: 3 });
        expect(dispatched()).toMatchObject({ step: 3, frequencyCap: "skip" });
    });

    it("sends customer replies to the business's Support Email, and to nobody when it is missing or invalid", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["email"], businessEmail: " owner@acmedental.test " });
        expect(dispatched().emailMessage.replyTo).toBe("owner@acmedental.test");
        for (const businessEmail of [null, "", "not-an-email"]) {
            mocks.dispatch.mockClear();
            await sendReviewRequest(admin, { ...base, contactMethods: ["email"], businessEmail });
            expect(dispatched().emailMessage.replyTo).toBeNull();
        }
    });

    it("uses the same reply-to for reminders", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["email"], isFollowUp: true, step: 2, businessEmail: "owner@acmedental.test" });
        expect(dispatched().emailMessage.replyTo).toBe("owner@acmedental.test");
    });

    it("falls back to the default subject, led by the customer's first name, when the campaign has none", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["email"], isFollowUp: true });
        expect(dispatched().emailMessage.subject).toBe("Sam, following up on your visit to Acme Dental");
    });

    it("strips HTML from a shared template for SMS instead of skipping the text", async () => {
        await sendReviewRequest(admin, { ...base, contactMethods: ["sms"], smsTemplate: "<p>Thanks {customer_name}!</p> {review_link}" });
        expect(dispatched().sms.body).toMatch(/^Thanks Sam! https:\/\/capture\.test\//);
    });

    it("passes through deferral so callers can wait out quiet hours", async () => {
        const until = new Date("2030-01-01T13:00:00Z");
        mocks.dispatch.mockResolvedValue({ sendStatus: "deferred", deferUntil: until, errorMessage: "Quiet hours", resendEmailId: null, smsLegStatus: null, emailLegStatus: null });
        const result = await sendReviewRequest(admin, { ...base, contactMethods: ["sms"] });
        expect(result).toMatchObject({ sendStatus: "deferred", deferUntil: until, smsSent: false });
    });

    it("keeps rendered subjects on one line", () => {
        expect(renderCampaignSubject("Hi {customer_name}\r\nBcc: x@example.test", "Sam", "Acme")).toBe("Hi Sam Bcc: x@example.test");
    });
});
