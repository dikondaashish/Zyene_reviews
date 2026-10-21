import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/resend/client", async () => {
    const { Resend } = await import("resend");
    return { resend: new Resend("re_synthetic_test_only") };
});
vi.mock("@/services/resend/collectratings-client", async () => {
    const { Resend } = await import("resend");
    return { resendCollectratings: new Resend("re_synthetic_collect_only") };
});
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn() } }));

import { sendEmail } from "@/services/resend/send-email";
import { sendReviewRequestEmail } from "@/services/resend/send-review-request-email";

const fetchMock = vi.fn();
beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_synthetic_test_only");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset().mockResolvedValue(new Response(JSON.stringify({ id: "email_fixture" }), {
        status: 200, headers: { "content-type": "application/json" },
    }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Resend provider-side replay protection", () => {
    it("sends the key as an HTTP header through the real SDK, never as email content", async () => {
        await expect(sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>",
            idempotencyKey: "stripe-checkout:cs_fixture" })).resolves.toMatchObject({ sent: true });
        const options = fetchMock.mock.calls[0][1] as RequestInit;
        expect(new Headers(options.headers).get("Idempotency-Key")).toBe("stripe-checkout:cs_fixture");
        expect(JSON.parse(String(options.body))).not.toHaveProperty("idempotencyKey");
    });
    it("preserves unkeyed email sends", async () => {
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>" });
        expect(new Headers(fetchMock.mock.calls[0][1].headers).has("Idempotency-Key")).toBe(false);
    });
    it("sets a usable support Reply-To without overriding the business Reply-To", async () => {
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>" });
        expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).reply_to).toEqual(["support@zyenereviews.com"]);
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>", replyTo: "business@example.test" });
        expect(JSON.parse(String(fetchMock.mock.calls[1][1].body)).reply_to).toEqual(["business@example.test"]);
    });
    it("sends one-click unsubscribe headers only for subscribed email", async () => {
        const url = "https://www.zyenereviews.com/api/marketing/newsletter/unsubscribe?id=synthetic";
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>", unsubscribeUrl: url });
        expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).headers).toMatchObject({
            "List-Unsubscribe": `<${url}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        });
    });
    it("retains the merchant Reply-To and plain-text fallback through the CollectRatings SDK", async () => {
        vi.stubEnv("RESEND_COLLECTRATINGS_API_KEY", "re_synthetic_collect_only");
        await sendReviewRequestEmail({ to: "fixture@example.test", subject: "Feedback",
            html: "<p>Share your experience</p>", replyTo: "merchant@example.test" });
        const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
        expect(body.reply_to).toEqual(["merchant@example.test"]);
        expect(body.text).toBe("Share your experience");
    });
    it("sends review requests as the person at the business on a per-business CollectRatings address", async () => {
        vi.stubEnv("RESEND_COLLECTRATINGS_API_KEY", "re_synthetic_collect_only");
        await sendReviewRequestEmail({ to: "fixture@example.test", subject: "Feedback", html: "<p>Hi</p>",
            fallbackBusinessName: 'The "Budget" <Wheels>', fallbackSenderName: "Sam" });
        const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
        expect(body.from).toBe("Sam at The Budget Wheels <the-budget-wheels@send.collectratings.com>");
    });
    it("uses the business name alone when no sender is set", async () => {
        vi.stubEnv("RESEND_COLLECTRATINGS_API_KEY", "re_synthetic_collect_only");
        await sendReviewRequestEmail({ to: "fixture@example.test", subject: "Feedback", html: "<p>Hi</p>",
            fallbackBusinessName: "Café Olé & Co." });
        expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).from).toBe("Café Olé & Co. <cafe-ole-and-co@send.collectratings.com>");
    });
    it("sends each Zyene stream from its own address, with marketing replies going to the person", async () => {
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>", stream: "billing" });
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>", stream: "marketing" });
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>Fixture</p>", stream: "forms" });
        const [billing, marketing, forms] = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1].body)));
        expect(billing.from).toBe("Zyene Reviews Billing <billing@zyenereviews.com>");
        expect(billing.reply_to).toEqual(["support@zyenereviews.com"]);
        expect(marketing.from).toBe("Ashish from Zyene <ashish@zyenereviews.com>");
        expect(marketing.reply_to).toEqual(["ashish@zyenereviews.com"]);
        expect(forms.from).toBe("Zyene Forms <forms@zyenereviews.com>");
    });
    it("delivers generated plain text with action URLs through the real SDK", async () => {
        await sendEmail({ to: "fixture@example.test", subject: "Fixture",
            html: '<p>Hello</p><p><a href="https://example.test/dashboard?a=1&amp;b=2">Open dashboard</a></p>' });
        const body = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { text: string };
        expect(body.text).toBe("Hello\n\nOpen dashboard (https://example.test/dashboard?a=1&b=2)");
    });
    it("preserves an explicitly supplied plain-text alternative", async () => {
        await sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "<p>HTML</p>", text: "Personal message" });
        const body = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { text: string };
        expect(body.text).toBe("Personal message");
    });
    it("does not contact the provider without server credentials", async () => {
        vi.stubEnv("RESEND_API_KEY", "");
        await expect(sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "Fixture",
            idempotencyKey: "fixture" })).resolves.toMatchObject({ sent: false });
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
