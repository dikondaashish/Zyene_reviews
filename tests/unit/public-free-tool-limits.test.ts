import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    resultLimit: vi.fn(), searchLimit: vi.fn(), emailLimit: vi.fn(),
    placeMetrics: vi.fn(), placesSearch: vi.fn(), lead: vi.fn(), sendEmail: vi.fn(),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
    clientIpFrom: () => "test-ip",
    publicToolResultRateLimit: { limit: mocks.resultLimit },
    publicToolSearchRateLimit: { limit: mocks.searchLimit },
    publicFormRateLimit: { limit: mocks.emailLimit },
}));
vi.mock("@/lib/free-tools/places-public", () => ({
    fetchPublicPlaceMetrics: mocks.placeMetrics,
    searchPublicPlaces: mocks.placesSearch,
}));
vi.mock("@/lib/free-tools/capture-tool-lead", () => ({ captureToolLead: mocks.lead }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.sendEmail }));

import { handlePlaceTool } from "@/lib/free-tools/place-tool-handler";
import { GET as searchPlaces } from "@/app/api/marketing/tools/places-search/route";
import { POST as reviewResponse } from "@/app/api/marketing/tools/review-response/route";

function placeRequest(email?: string) {
    return new Request("http://localhost/api/marketing/tools/review-link", {
        method: "POST", body: JSON.stringify({ placeId: "place-123", email }),
    });
}

describe("public free-tool cost limits", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.resultLimit.mockResolvedValue({ success: true });
        mocks.searchLimit.mockResolvedValue({ success: true });
        mocks.emailLimit.mockResolvedValue({ success: true });
    });

    it("does not call Places Details when a public result limit is reached", async () => {
        mocks.resultLimit.mockResolvedValue({ success: false });
        const response = await handlePlaceTool(placeRequest(), "review-link");
        expect(response.status).toBe(429);
        expect(mocks.placeMetrics).not.toHaveBeenCalled();
    });

    it("fails closed when the Places limiter is unavailable", async () => {
        mocks.resultLimit.mockRejectedValue(new Error("Redis unavailable"));
        const response = await handlePlaceTool(placeRequest(), "reputation-score");
        expect(response.status).toBe(503);
        expect(mocks.placeMetrics).not.toHaveBeenCalled();
    });

    it("does not call Places autocomplete when rate-limited", async () => {
        mocks.searchLimit.mockResolvedValue({ success: false });
        const response = await searchPlaces(new Request("http://localhost/api/marketing/tools/places-search?q=cafe"));
        expect(response.status).toBe(429);
        expect(mocks.placesSearch).not.toHaveBeenCalled();
    });

    it("does not spend a Places call on invalid or short queries", async () => {
        expect((await searchPlaces(new Request("http://localhost/api/marketing/tools/places-search?q=a"))).status).toBe(200);
        expect((await searchPlaces(new Request(`http://localhost/api/marketing/tools/places-search?q=${"a".repeat(121)}`))).status).toBe(400);
        expect(mocks.searchLimit).not.toHaveBeenCalled();
        expect(mocks.placesSearch).not.toHaveBeenCalled();
    });

    it("does not capture a lead or send bonus email when email-limited", async () => {
        mocks.emailLimit.mockResolvedValue({ success: false });
        const response = await reviewResponse(new Request("http://localhost/api/marketing/tools/review-response", {
            method: "POST", body: JSON.stringify({ rating: 5, email: "user@example.com", sendBonus: true }),
        }));
        expect(response.status).toBe(429);
        expect(mocks.lead).not.toHaveBeenCalled();
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });
});
