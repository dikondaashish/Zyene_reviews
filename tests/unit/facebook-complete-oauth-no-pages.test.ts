import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    exchange: vi.fn(),
    longLived: vi.fn(),
    graphFetch: vi.fn(),
    getPages: vi.fn(),
    save: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({ logger: { warn: mocks.warn } }));
vi.mock("@/services/facebook/client", () => ({
    exchangeCodeForToken: mocks.exchange,
    getLongLivedToken: mocks.longLived,
    graphFetch: mocks.graphFetch,
}));
vi.mock("@/services/facebook/adapter", () => ({ getPages: mocks.getPages }));
vi.mock("@/services/facebook/connect-session", () => ({ saveFacebookConnectData: mocks.save }));

import { completeFacebookOAuth } from "@/services/facebook/complete-oauth";

describe("completeFacebookOAuth with no Pages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.exchange.mockResolvedValue({ access_token: "short-token" });
        mocks.longLived.mockResolvedValue({ access_token: "long-token", expires_in: 3600 });
        mocks.getPages.mockResolvedValue([]);
    });

    it("logs granted and declined permissions without tokens and saves nothing", async () => {
        mocks.graphFetch.mockResolvedValue({
            data: [
                { permission: "pages_show_list", status: "granted" },
                { permission: "business_management", status: "declined" },
            ],
        });

        const result = await completeFacebookOAuth("code", "https://app.example.com/cb", "user-1", "biz-1");

        expect(result).toBeNull();
        expect(mocks.save).not.toHaveBeenCalled();
        const [fields] = mocks.warn.mock.calls[0];
        expect(fields).toMatchObject({
            userId: "user-1",
            businessId: "biz-1",
            pageCount: 0,
            granted: ["pages_show_list"],
            declined: ["business_management"],
        });
        expect(JSON.stringify(mocks.warn.mock.calls)).not.toContain("long-token");
    });

    it("still returns null when the permission lookup fails", async () => {
        mocks.graphFetch.mockRejectedValue(new Error("Facebook Graph API error: 400"));

        await expect(completeFacebookOAuth("code", "https://app.example.com/cb", "user-1", "biz-1"))
            .resolves.toBeNull();
        expect(mocks.warn).toHaveBeenCalledTimes(1);
    });
});
