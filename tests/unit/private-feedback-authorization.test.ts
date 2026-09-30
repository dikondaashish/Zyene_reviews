import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ limit: vi.fn(), createAdminClient: vi.fn() }));
vi.mock("@/lib/auth/rate-limit", () => ({
    clientIpFrom: () => "test-ip", publicFormRateLimit: { limit: mocks.limit },
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/notifications/review-alert", () => ({ sendReviewAlert: vi.fn() }));
vi.mock("@/domains/ai/services/ai-analysis-service", () => ({ categorizePrivateFeedback: vi.fn() }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: vi.fn() }));

import { handlePrivateFeedbackPost } from "@/services/reviews/private-feedback-api";
import { signReviewTracking } from "@/lib/review-requests/tracking-token";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

function post(token?: string, businessId = BUSINESS_ID) {
    return new Request("https://collectratings.com/api/reviews/private", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, review_request_id: REQUEST_ID,
            token, rating: 2, content: "Feedback" }),
    });
}

describe("private feedback request authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-review-tracking-secret";
        mocks.limit.mockResolvedValue({ success: true });
    });

    it("denies a bare review-request UUID before admin access", async () => {
        expect((await handlePrivateFeedbackPost(post())).status).toBe(400);
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });

    it("denies a token signed for another tenant's business", async () => {
        const token = signReviewTracking(REQUEST_ID, BUSINESS_ID);
        expect((await handlePrivateFeedbackPost(post(token,
            "33333333-3333-4333-8333-333333333333"))).status).toBe(403);
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });

    it("requires the signed request to belong to the submitted business", async () => {
        const filters: Record<string, string> = {};
        const query = {
            select: () => query,
            eq: (key: string, value: string) => { filters[key] = value; return query; },
            maybeSingle: async () => ({ data: null, error: null }),
        };
        mocks.createAdminClient.mockReturnValue({ from: () => query });
        const response = await handlePrivateFeedbackPost(post(signReviewTracking(REQUEST_ID, BUSINESS_ID)));
        expect(response.status).toBe(404);
        expect(filters).toMatchObject({ id: REQUEST_ID, business_id: BUSINESS_ID });
    });
});
