import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sms: vi.fn(), email: vi.fn() }));
vi.mock("@/services/twilio/send-sms", () => ({ sendSMS: mocks.sms }));
vi.mock("@/services/resend/send-review-request-email", () => ({ sendReviewRequestEmail: mocks.email }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { renderCampaignSubject, sendReviewRequest } from "@/lib/notifications/review-request";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";

const base = { requestId: "request-a", businessId: "business-a", businessSlug: "acme-dental", businessName: "Acme Dental",
    customerName: "Sam", customerEmail: "synthetic@example.test", customerPhone: "+15555550100" };

describe("campaign / drip review request sender", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-tracking-secret");
        vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "zyenereviews.test");
        vi.stubEnv("NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN", "capture.test");
        mocks.sms.mockResolvedValue({ sent: true, error: null });
        mocks.email.mockResolvedValue({ sent: true });
    });

    it("links to the public review page with a signed per-request ref, not /review/{businessId}", async () => {
        const result = await sendReviewRequest({ ...base, contactMethods: ["sms"], smsTemplate: "Hi {customer_name}: {review_link}" });
        const url = new URL(result.reviewLink!);
        expect(`${url.origin}${url.pathname}`).toBe("https://capture.test/acme-dental");
        expect(url.searchParams.get("ref")).toBe("request-a");
        expect(verifyReviewTracking("request-a", "business-a", url.searchParams.get("sig"))).toBe(true);
        expect(mocks.sms).toHaveBeenCalledWith("+15555550100", `Hi Sam: ${result.reviewLink}`);
        expect(result.reviewLink).not.toContain("/review/");
    });

    it("uses the SMS template for SMS and the email template and subject for email", async () => {
        await sendReviewRequest({ ...base, contactMethods: ["sms", "email"], smsTemplate: "Text {review_link}",
            emailTemplate: "<p>Hello {customer_name}, <a href=\"{review_link}\">review</a></p>", emailSubject: "Thanks {customer_name}" });
        expect(mocks.sms.mock.calls[0][1]).toMatch(/^Text https:\/\/capture\.test\/acme-dental\?ref=request-a/);
        const email = mocks.email.mock.calls[0][0];
        expect(email.subject).toBe("Thanks Sam");
        expect(email.html).toContain("Hello Sam");
        expect(email.html).not.toContain("Text ");
    });

    it("falls back to the default subject when the campaign has none", async () => {
        await sendReviewRequest({ ...base, contactMethods: ["email"], isFollowUp: true });
        expect(mocks.email.mock.calls[0][0].subject).toBe("Following up on your visit to Acme Dental");
    });

    it("still sends SMS when a shared template contains HTML, with tags stripped", async () => {
        await sendReviewRequest({ ...base, contactMethods: ["sms"], smsTemplate: "<p>Thanks {customer_name}!</p> {review_link}" });
        expect(mocks.sms).toHaveBeenCalledTimes(1);
        expect(mocks.sms.mock.calls[0][1]).toMatch(/^Thanks Sam! https:\/\/capture\.test\//);
    });

    it("keeps rendered subjects on one line", () => {
        expect(renderCampaignSubject("Hi {customer_name}\r\nBcc: x@example.test", "Sam", "Acme")).toBe("Hi Sam Bcc: x@example.test");
    });
});
