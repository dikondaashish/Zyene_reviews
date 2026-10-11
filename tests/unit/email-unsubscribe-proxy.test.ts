import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { handleApiGuards } from "@/lib/routing/proxy-api-guards";

const { limit } = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("@/lib/auth/rate-limit", () => ({ globalApiRateLimit: { limit } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

const endpoints = [
    "/api/marketing/newsletter/unsubscribe",
    "/api/marketing/product-email/unsubscribe",
];

describe("email-provider unsubscribe through API guards", () => {
    beforeEach(() => limit.mockResolvedValue({ success: true }));

    it.each(endpoints)("allows an origin-less provider POST to %s", async (path) => {
        const request = new NextRequest(`https://www.zyenereviews.com${path}?id=00000000-0000-4000-8000-000000000001`, {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "List-Unsubscribe=One-Click",
        });
        expect(await handleApiGuards(request, path, "www.zyenereviews.com")).toBeNull();
        expect(limit).toHaveBeenCalled();
    });

    it.each(["/api/marketing/newsletter/subscribe", `${endpoints[0]}/extra`, `${endpoints[1]}/extra`])(
        "retains origin protection for %s", async (path) => {
            const request = new NextRequest(`https://www.zyenereviews.com${path}`, { method: "POST" });
            expect((await handleApiGuards(request, path, "www.zyenereviews.com"))?.status).toBe(403);
        },
    );

    it("keeps unsupported mutations protected", async () => {
        const request = new NextRequest(`https://www.zyenereviews.com${endpoints[0]}`, { method: "DELETE" });
        expect((await handleApiGuards(request, endpoints[0], "www.zyenereviews.com"))?.status).toBe(403);
    });

    it("retains rate limits on unsubscribe requests", async () => {
        limit.mockResolvedValue({ success: false });
        const request = new NextRequest(`https://www.zyenereviews.com${endpoints[1]}`, { method: "POST" });
        expect((await handleApiGuards(request, endpoints[1], "www.zyenereviews.com"))?.status).toBe(429);
    });
});
