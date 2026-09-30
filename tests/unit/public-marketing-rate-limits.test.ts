import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ newsletterLimit: vi.fn(), formLimit: vi.fn(), subscribe: vi.fn(), book: vi.fn() }));
vi.mock("@/lib/auth/rate-limit", () => ({
    clientIpFrom: () => "test-ip",
    publicNewsletterRateLimit: { limit: mocks.newsletterLimit },
    publicFormRateLimit: { limit: mocks.formLimit },
}));
vi.mock("@/lib/marketing/newsletter-subscribe", () => ({ processNewsletterSubscribe: mocks.subscribe }));
vi.mock("@/lib/marketing/book-lead", () => ({ captureBookLead: mocks.book }));

import { POST as subscribe } from "@/app/api/marketing/newsletter/subscribe/route";
import { POST as book } from "@/app/api/marketing/book-lead/route";

const post = (path: string) => new Request(`https://zyenereviews.com${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "person@example.com" }),
});

describe("public marketing limits", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.newsletterLimit.mockResolvedValue({ success: true });
        mocks.formLimit.mockResolvedValue({ success: true });
        mocks.subscribe.mockResolvedValue({ ok: true, newLead: true });
        mocks.book.mockResolvedValue({ ok: true, downloadUrl: "/guide.pdf", emailSent: false });
    });

    it("blocks newsletter mail fanout before subscriber writes", async () => {
        mocks.newsletterLimit.mockResolvedValue({ success: false });
        expect((await subscribe(post("/api/marketing/newsletter/subscribe"))).status).toBe(429);
        expect(mocks.subscribe).not.toHaveBeenCalled();
    });

    it("fails closed if the newsletter limiter is down", async () => {
        mocks.newsletterLimit.mockRejectedValue(new Error("limiter down"));
        expect((await subscribe(post("/api/marketing/newsletter/subscribe"))).status).toBe(503);
        expect(mocks.subscribe).not.toHaveBeenCalled();
    });

    it("enforces limits on Vercel preview deployments", async () => {
        const prior = process.env.VERCEL_ENV;
        process.env.VERCEL_ENV = "preview";
        try {
            mocks.formLimit.mockResolvedValue({ success: false });
            expect((await book(post("/api/marketing/book-lead"))).status).toBe(429);
            expect(mocks.book).not.toHaveBeenCalled();
        } finally {
            if (prior === undefined) delete process.env.VERCEL_ENV;
            else process.env.VERCEL_ENV = prior;
        }
    });

    it("also enforces limits when no deployment environment is configured", async () => {
        const prior = process.env.VERCEL_ENV;
        delete process.env.VERCEL_ENV;
        try {
            mocks.formLimit.mockResolvedValueOnce({ success: false });
            expect((await book(post("/api/marketing/book-lead"))).status).toBe(429);
            mocks.formLimit.mockRejectedValueOnce(new Error("limiter unavailable"));
            expect((await book(post("/api/marketing/book-lead"))).status).toBe(503);
            expect(mocks.book).not.toHaveBeenCalled();
        } finally {
            if (prior !== undefined) process.env.VERCEL_ENV = prior;
        }
    });
});
