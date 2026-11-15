import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    formLimit: vi.fn(),
    receiptLimit: vi.fn(),
    sendEmail: vi.fn(),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
    publicFormRateLimit: { limit: mocks.formLimit },
    contactReceiptRateLimit: { limit: mocks.receiptLimit },
    clientIpFrom: () => "203.0.113.7",
}));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } }));

import { handleContactPost } from "@/services/marketing/contact-api";

const human = {
    name: "Dana Owner",
    email: "dana@example.com",
    subject: "General Inquiry",
    message: "Do you support multi-location businesses?",
    website: "",
    elapsedMs: 24_000,
};

const post = (body: unknown) =>
    handleContactPost(new Request("https://www.zyenereviews.com/api/marketing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }));

describe("POST /api/marketing/contact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.formLimit.mockResolvedValue({ success: true });
        mocks.receiptLimit.mockResolvedValue({ success: true });
        mocks.sendEmail.mockResolvedValue({ success: true });
    });

    it("sends the notification and the receipt for a real visitor", async () => {
        const res = await post(human);
        expect(res.status).toBe(200);
        expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
        expect(mocks.sendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
            to: "contact@zyenereviews.com",
            subject: "[Contact] General Inquiry - Dana Owner",
            replyTo: "dana@example.com",
        }));
        expect(mocks.sendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
            to: "dana@example.com",
            subject: "We received your message - Zyene Reviews",
        }));
    });

    it("pretends to succeed but sends nothing when the honeypot is filled", async () => {
        const res = await post({ ...human, name: "Nvts Iisgcf", website: "https://spam.example" });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
        expect(mocks.sendEmail).not.toHaveBeenCalled();
        expect(mocks.receiptLimit).not.toHaveBeenCalled();
    });

    it("pretends to succeed but sends nothing when submitted faster than a person types", async () => {
        const res = await post({ ...human, elapsedMs: 400 });
        expect(res.status).toBe(200);
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it.each([
        ["missing", undefined],
        ["not a number", "24000"],
    ])("rejects a post with %s timing without sending", async (_label, elapsedMs) => {
        const res = await post({ ...human, elapsedMs });
        expect(res.status).toBe(400);
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("still notifies the team but skips the receipt once an address has had one today", async () => {
        mocks.receiptLimit.mockResolvedValue({ success: false });
        const res = await post(human);
        expect(res.status).toBe(200);
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
        expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "contact@zyenereviews.com" }));
        expect(mocks.receiptLimit).toHaveBeenCalledWith("dana@example.com");
    });

    it("skips the receipt when the receipt limiter is unreachable", async () => {
        mocks.receiptLimit.mockRejectedValue(new Error("redis down"));
        expect((await post(human)).status).toBe(200);
        expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("keeps the per-IP rate limit, and fails closed when it is unreachable", async () => {
        mocks.formLimit.mockResolvedValue({ success: false });
        expect((await post(human)).status).toBe(429);
        mocks.formLimit.mockRejectedValue(new Error("redis down"));
        expect((await post(human)).status).toBe(503);
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });
});
