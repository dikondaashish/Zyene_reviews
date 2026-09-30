import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createAdminClient: vi.fn(), terminateDrip: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/campaigns/terminate-drip", () => ({ terminateReviewRequestDrip: mocks.terminateDrip }));

import { signedReviewLink, signReviewTracking, verifyReviewTracking } from
    "@/lib/review-requests/tracking-token";
import { POST } from "@/app/api/track/review/route";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

function trackingRequest(token?: string, businessId = BUSINESS_ID) {
    return new Request("https://collectratings.com/api/track/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "update", requestId: REQUEST_ID, businessId, token,
            trackData: { status: "completed", completed_at: "2026-09-29T12:00:00.000Z" },
        }),
    });
}

describe("review request tracking capability", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-review-tracking-secret";
    });

    it("signs links for one request and one business only", () => {
        const link = new URL(signedReviewLink("https://collectratings.com/shop", REQUEST_ID, BUSINESS_ID));
        const token = link.searchParams.get("sig");
        expect(link.searchParams.get("ref")).toBe(REQUEST_ID);
        expect(verifyReviewTracking(REQUEST_ID, BUSINESS_ID, token)).toBe(true);
        expect(verifyReviewTracking(REQUEST_ID, "33333333-3333-4333-8333-333333333333", token)).toBe(false);
        expect(verifyReviewTracking("44444444-4444-4444-8444-444444444444", BUSINESS_ID, token)).toBe(false);
    });

    it("rejects a bare or forged UUID before privileged access", async () => {
        expect((await POST(trackingRequest())).status).toBe(400);
        expect((await POST(trackingRequest("forged"))).status).toBe(403);
        expect((await POST(trackingRequest(signReviewTracking(REQUEST_ID, BUSINESS_ID),
            "33333333-3333-4333-8333-333333333333"))).status).toBe(403);
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });

    it("updates only the signed business request", async () => {
        const filters: Record<string, string> = {};
        const query = {
            select: () => query,
            eq: (key: string, value: string) => {
                filters[key] = value;
                return query;
            },
            maybeSingle: async () => ({ data: { id: REQUEST_ID }, error: null }),
            update: () => query,
            then: (resolve: (value: unknown) => void) => resolve({ error: null }),
        };
        mocks.createAdminClient.mockReturnValue({ from: () => query });
        mocks.terminateDrip.mockResolvedValue(undefined);

        const response = await POST(trackingRequest(signReviewTracking(REQUEST_ID, BUSINESS_ID)));
        expect(response.status).toBe(200);
        expect(filters).toMatchObject({ id: REQUEST_ID, business_id: BUSINESS_ID });
        expect(mocks.terminateDrip).toHaveBeenCalledOnce();
    });
});
