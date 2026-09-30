import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/resend/client", async () => {
    const { Resend } = await import("resend");
    return { resend: new Resend("re_synthetic_test_only") };
});
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn() } }));

import { sendEmail } from "@/services/resend/send-email";

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
    it("does not contact the provider without server credentials", async () => {
        vi.stubEnv("RESEND_API_KEY", "");
        await expect(sendEmail({ to: "fixture@example.test", subject: "Fixture", html: "Fixture",
            idempotencyKey: "fixture" })).resolves.toMatchObject({ sent: false });
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
