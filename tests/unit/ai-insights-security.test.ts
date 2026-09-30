import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    client: vi.fn(), context: vi.fn(), access: vi.fn(), rate: vi.fn(), budget: vi.fn(),
    generate: vi.fn(), get: vi.fn(), set: vi.fn(), from: vi.fn(), eq: vi.fn(),
    user: { id: "user-a" } as { id: string } | null,
    business: { id: "business-a", name: "Synthetic business", organization_id: "org-a" },
    organization: { plan: "starter", plan_status: "active" } as Record<string, string> | null,
    reviews: [] as { text: string; rating: number }[],
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/auth/business-context", () => ({ getActiveBusinessId: mocks.context }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiRateLimit: { limit: mocks.rate } }));
vi.mock("@/services/ai/ai-business-budget", () => ({ checkAiBusinessDailyBudget: mocks.budget }));
vi.mock("@/lib/db/redis", () => ({ redis: { get: mocks.get, set: mocks.set } }));
vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({ generateContentWithFallback: mocks.generate }));
vi.mock("@/lib/logger", () => ({ createRequestLogger: () => ({
    requestId: "synthetic", logger: { info: vi.fn(), error: vi.fn() },
}) }));
import { handleAiInsights } from "@/services/ai/ai-insights-api";

describe("AI insights authorization and spend boundaries", () => {
    const request = () => new Request("https://example.test/api/ai/insights?businessId=foreign-business");
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.user = { id: "user-a" };
        mocks.organization = { plan: "starter", plan_status: "active" };
        mocks.reviews = Array.from({ length: 5 }, () => ({ text: "Good service", rating: 5 }));
        mocks.context.mockResolvedValue({ businessId: "business-a", business: mocks.business });
        mocks.access.mockResolvedValue(true);
        mocks.rate.mockResolvedValue({ success: true });
        mocks.budget.mockResolvedValue(null);
        mocks.get.mockResolvedValue(null);
        mocks.generate.mockResolvedValue('{"themes":[],"suggestions":["Keep it up"]}');
        mocks.from.mockImplementation((table: string) => {
            const query = {
                select: () => query, eq: mocks.eq.mockImplementation(() => query),
                not: () => query, neq: () => query, order: () => query,
                single: async () => ({ data: table === "businesses" ? mocks.business : mocks.organization }),
                limit: async () => ({ data: mocks.reviews, count: mocks.reviews.length }),
            };
            return query;
        });
        mocks.client.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: mocks.user } }) }, from: mocks.from });
    });
    it("denies missing authentication before reading any tenant cache", async () => {
        mocks.user = null;
        expect((await handleAiInsights(request())).status).toBe(401);
        expect(mocks.get).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it.each(["foreign tenant", "sibling business", "revoked membership"])("denies %s before cached data or model work", async () => {
        mocks.access.mockResolvedValue(false);
        mocks.get.mockResolvedValue({ suggestions: ["Private insight"] });
        expect((await handleAiInsights(request())).status).toBe(403);
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), "user-a", "business-a");
        expect(mocks.get).not.toHaveBeenCalled();
        expect(mocks.from).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it.each(["canceled", "past_due"])("denies %s plans, even with cached insights", async (status) => {
        mocks.organization = { plan: "starter", plan_status: status };
        mocks.get.mockResolvedValue({ suggestions: ["Private insight"] });
        expect((await handleAiInsights(request())).status).toBe(403);
        expect(mocks.get).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("denies an unrecognized plan before paid work", async () => {
        mocks.organization = { plan: "free", plan_status: "active" };
        expect((await handleAiInsights(request())).status).toBe(403);
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("checks the server-resolved business budget on a cache miss", async () => {
        mocks.budget.mockResolvedValue(new Response(null, { status: 429 }));
        expect((await handleAiInsights(request())).status).toBe(429);
        expect(mocks.budget).toHaveBeenCalledWith("business-a");
        expect(mocks.eq).toHaveBeenCalledWith("business_id", "business-a");
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("fails closed when cache and budget services are unavailable", async () => {
        mocks.get.mockRejectedValue(new Error("Cache offline"));
        mocks.budget.mockResolvedValue(new Response(null, { status: 503 }));
        expect((await handleAiInsights(request())).status).toBe(503);
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("denies per-user rate exhaustion before model work", async () => {
        mocks.rate.mockResolvedValue({ success: false });
        expect((await handleAiInsights(request())).status).toBe(429);
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("returns a structured failure when authorization or limits cannot be checked", async () => {
        mocks.access.mockRejectedValue(new Error("Database unavailable"));
        expect((await handleAiInsights(request())).status).toBe(503);
        expect(mocks.get).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("caps review input and model output even for unusually long stored text", async () => {
        mocks.reviews[0].text = "a".repeat(2000) + "UNBOUNDED_REVIEW_TAIL";
        expect((await handleAiInsights(request())).status).toBe(200);
        expect(mocks.generate).toHaveBeenCalledWith(
            expect.not.stringContaining("UNBOUNDED_REVIEW_TAIL"),
            expect.objectContaining({ maxOutputTokens: 2048 }),
        );
    });
    it("serves authorized cached insights without consuming model budget", async () => {
        mocks.get.mockResolvedValue({ themes: [], suggestions: ["Cached"], reviewCount: 5 });
        const response = await handleAiInsights(request());
        expect(response.status).toBe(200);
        expect((await response.json()).data.suggestions).toEqual(["Cached"]);
        expect(mocks.budget).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("preserves eligible generation and tenant-scoped caching", async () => {
        expect((await handleAiInsights(request())).status).toBe(200);
        expect(mocks.eq).toHaveBeenCalledWith("id", "org-a");
        expect(mocks.generate).toHaveBeenCalledTimes(1);
        expect(mocks.set).toHaveBeenCalledWith("ai_insights:business-a", expect.any(String), { ex: 86400 });
    });
    it("does not spend a model budget when there are too few reviews", async () => {
        mocks.reviews = [];
        expect((await handleAiInsights(request())).status).toBe(200);
        expect(mocks.budget).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });
});
