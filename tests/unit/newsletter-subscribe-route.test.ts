import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    checkBotId: vi.fn(),
    limit: vi.fn(),
    subscribe: vi.fn(),
}));

vi.mock("botid/server", () => ({ checkBotId: mocks.checkBotId }));
vi.mock("@/lib/auth/rate-limit", () => ({
    publicNewsletterRateLimit: { limit: mocks.limit },
    clientIpFrom: () => "203.0.113.7",
}));
vi.mock("@/lib/marketing/newsletter-subscribe", () => ({ processNewsletterSubscribe: mocks.subscribe }));

import { POST } from "@/app/api/marketing/newsletter/subscribe/route";

const post = (body: unknown) =>
    POST(new Request("https://www.zyenereviews.com/api/marketing/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }));

describe("POST /api/marketing/newsletter/subscribe", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.checkBotId.mockResolvedValue({ isBot: false });
        mocks.limit.mockResolvedValue({ success: true });
        mocks.subscribe.mockResolvedValue({ ok: true, newLead: true });
    });

    it("blocks requests the bot check flags", async () => {
        mocks.checkBotId.mockResolvedValue({ isBot: true });
        const res = await post({ email: "owner@example.com" });
        expect(res.status).toBe(403);
        expect(mocks.subscribe).not.toHaveBeenCalled();
    });

    it("pretends to succeed but stores nothing when the honeypot is filled", async () => {
        const res = await post({ email: "victim@example.com", website: "https://spam.example" });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, newLead: false });
        expect(mocks.subscribe).not.toHaveBeenCalled();
    });

    it("subscribes a real visitor", async () => {
        const res = await post({ email: "owner@example.com", source: "blog", website: "" });
        expect(res.status).toBe(200);
        expect(mocks.subscribe).toHaveBeenCalledWith(expect.objectContaining({ email: "owner@example.com", source: "blog" }));
    });

    it("keeps the per-IP rate limit", async () => {
        mocks.limit.mockResolvedValue({ success: false });
        expect((await post({ email: "owner@example.com" })).status).toBe(429);
    });
});
