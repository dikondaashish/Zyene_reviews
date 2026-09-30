import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createPublicReviewOpen: vi.fn(),
    recordOpen: vi.fn(),
    ipLimit: vi.fn(),
    businessLimit: vi.fn(),
}));
vi.mock("@/services/review-flow/create-public-review-open", () => ({
    createPublicReviewOpen: mocks.createPublicReviewOpen,
}));
vi.mock("@/lib/review-requests/record-review-request-open", () => ({
    recordReviewRequestOpenForRef: mocks.recordOpen,
}));
vi.mock("@/lib/auth/rate-limit", () => ({
    clientIpFrom: () => "test-ip",
    publicReviewOpenIpRateLimit: { limit: mocks.ipLimit },
    publicReviewOpenBusinessRateLimit: { limit: mocks.businessLimit },
}));

import { POST } from "@/app/api/track/review-open/route";
import { signReviewTracking } from "@/lib/review-requests/tracking-token";

const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";
const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const post = (body: unknown) => new Request("https://collectratings.com/api/track/review-open", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

describe("public review-open authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-review-tracking-secret";
        mocks.ipLimit.mockResolvedValue({ success: true });
        mocks.businessLimit.mockResolvedValue({ success: true });
        mocks.recordOpen.mockResolvedValue({ ok: true });
        mocks.createPublicReviewOpen.mockResolvedValue({ requestId: REQUEST_ID, token: "signed" });
    });

    it("rejects a leaked request UUID without a valid link signature", async () => {
        expect((await POST(post({ businessId: BUSINESS_ID, requestId: REQUEST_ID }))).status).toBe(403);
        expect(mocks.recordOpen).not.toHaveBeenCalled();
        expect(mocks.createPublicReviewOpen).not.toHaveBeenCalled();
    });

    it("rejects an arbitrary business ID without a rendered-page token", async () => {
        expect((await POST(post({ businessId: BUSINESS_ID }))).status).toBe(403);
        expect(mocks.createPublicReviewOpen).not.toHaveBeenCalled();
    });

    it("fails closed when the anonymous rate limiter is unavailable", async () => {
        mocks.ipLimit.mockRejectedValue(new Error("Redis unavailable"));
        const response = await POST(post({ businessId: BUSINESS_ID,
            openToken: signReviewTracking("public-open", BUSINESS_ID) }));
        expect(response.status).toBe(503);
        expect(mocks.createPublicReviewOpen).not.toHaveBeenCalled();
    });

    it("opens only the signed request in the signed business", async () => {
        const response = await POST(post({ businessId: BUSINESS_ID, requestId: REQUEST_ID,
            token: signReviewTracking(REQUEST_ID, BUSINESS_ID) }));
        expect(response.status).toBe(200);
        expect(mocks.recordOpen).toHaveBeenCalledWith({ businessId: BUSINESS_ID, requestId: REQUEST_ID });
    });

    it("issues a fresh token for a rate-limited anonymous visitor", async () => {
        const response = await POST(post({ businessId: BUSINESS_ID,
            openToken: signReviewTracking("public-open", BUSINESS_ID) }));
        expect(response.status).toBe(200);
        expect(mocks.createPublicReviewOpen).toHaveBeenCalledWith(BUSINESS_ID);
    });
});
