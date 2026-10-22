import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), info: vi.fn(), error: vi.fn() }));

vi.mock("@/lib/http/fetch-with-timeout", () => ({ fetchWithTimeout: mocks.fetch }));
vi.mock("@/lib/logger", () => ({ logger: { info: mocks.info, error: mocks.error } }));

import { getYelpCardView } from "@/components/integrations/yelp-card-view";
import { YelpApiError, yelpFetch } from "@/services/yelp/client";

describe("getYelpCardView", () => {
    it("opens the connect flow after Reconnect on an errored listing", () => {
        expect(getYelpCardView({ isConnected: false, hasError: true, showConnect: false })).toBe("error");
        expect(getYelpCardView({ isConnected: false, hasError: true, showConnect: true })).toBe("connect");
    });

    it("shows the connected card whenever the listing is active", () => {
        expect(getYelpCardView({ isConnected: true, hasError: false, showConnect: true })).toBe("connected");
        expect(getYelpCardView({ isConnected: false, hasError: false, showConnect: false })).toBe("connect");
    });
});

describe("yelpFetch logging", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.YELP_API_KEY = "test-key";
        mocks.fetch.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found",
            text: async () => '{"error":{"code":"NOT_FOUND"}}',
        });
    });

    it("logs an expected 404 at info and still throws it", async () => {
        await expect(yelpFetch({ path: "/businesses/x/reviews", expectedStatuses: [404] }))
            .rejects.toBeInstanceOf(YelpApiError);
        expect(mocks.info).toHaveBeenCalledTimes(1);
        expect(mocks.error).not.toHaveBeenCalled();
    });

    it("logs an unexpected 404 as an error", async () => {
        await expect(yelpFetch({ path: "/businesses/x" })).rejects.toThrow("Yelp API error: 404");
        expect(mocks.error).toHaveBeenCalledTimes(1);
    });
});
