import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ client: vi.fn(), context: vi.fn(), authorize: vi.fn(), access: vi.fn(), budget: vi.fn(), load: vi.fn(), generate: vi.fn(), get: vi.fn(), set: vi.fn(), eval: vi.fn(), user: { id: "u" } as { id: string } | null }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/auth/business-context", () => ({ getActiveBusinessId: mocks.context }));
vi.mock("@/services/ai/authorize-insights", () => ({ authorizeInsights: mocks.authorize }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/services/ai/ai-business-budget", () => ({ checkAiBusinessDailyBudget: mocks.budget }));
vi.mock("@/app/w/[slug]/load-widget-page-data", () => ({ loadWidgetPageData: mocks.load }));
vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({ generateContentWithFallback: mocks.generate }));
vi.mock("@/lib/db/redis", () => ({ redis: { get: mocks.get, set: mocks.set, eval: mocks.eval } }));
vi.mock("@/lib/logger", () => ({ createRequestLogger: () => ({ requestId: "test", logger: { error: vi.fn() } }) }));
import { handleWidgetSummaryPost } from "@/services/widgets/summary-api";
const reviews = Array.from({ length: 5 }, (_, i) => ({ id: String(i), author_name: "Sample", platform: "google", rating: 5, content: "Good service", created_at: "2026-09-01" }));
const request = (body: unknown = { slug: "example", source: "google" }) => new Request("https://app.test/api/widgets/summary", { method: "POST", body: JSON.stringify(body) });
beforeEach(() => {
    vi.resetAllMocks(); mocks.user = { id: "u" };
    mocks.context.mockResolvedValue({ businessId: "business-a" });
    mocks.authorize.mockResolvedValue({ response: null }); mocks.access.mockResolvedValue(true);
    mocks.budget.mockResolvedValue(null); mocks.get.mockResolvedValue(null); mocks.set.mockResolvedValue("OK");
    mocks.generate.mockResolvedValue('{"points":["Friendly service","Good quality","Welcoming atmosphere"]}');
    mocks.load.mockResolvedValue({ kind: "ok", formattedReviews: reviews });
    const query = { select: () => query, eq: () => query, single: async () => ({ data: { slug: "example" }, error: null }) };
    mocks.client.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: mocks.user } }) }, from: () => query });
});
describe("widget summary authorization and publication", () => {
    it("rejects unauthenticated callers before public reads, caching or spending", async () => {
        mocks.user = null;
        expect((await handleWidgetSummaryPost(request())).status).toBe(401);
        expect(mocks.load).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("rejects unknown input and a foreign slug before reading its data", async () => {
        expect((await handleWidgetSummaryPost(request({ slug: "example", businessId: "foreign" }))).status).toBe(400);
        expect((await handleWidgetSummaryPost(request({ slug: "foreign" }))).status).toBe(403);
        expect(mocks.load).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("denies plan/access failures and viewers before cache reads or model work", async () => {
        mocks.authorize.mockResolvedValueOnce({ response: new Response(null, { status: 403 }) });
        expect((await handleWidgetSummaryPost(request())).status).toBe(403);
        mocks.access.mockResolvedValue(false);
        expect((await handleWidgetSummaryPost(request())).status).toBe(403);
        expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("serves an authorized cached summary without spending", async () => {
        mocks.get.mockResolvedValue({ points: ["Existing summary"], reviewCount: 5 });
        expect((await handleWidgetSummaryPost(request())).status).toBe(200);
        expect(mocks.budget).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("fails closed on cache/budget errors and concurrent generation", async () => {
        mocks.get.mockRejectedValueOnce(new Error("Offline"));
        expect((await handleWidgetSummaryPost(request())).status).toBe(503);
        mocks.budget.mockResolvedValueOnce(new Response(null, { status: 429 }));
        expect((await handleWidgetSummaryPost(request())).status).toBe(429);
        mocks.set.mockResolvedValueOnce(null);
        expect((await handleWidgetSummaryPost(request())).status).toBe(409);
        expect(mocks.generate).not.toHaveBeenCalled();
    });
    it("generates bounded public feedback and caches the genuine aggregate", async () => {
        expect((await handleWidgetSummaryPost(request())).status).toBe(200);
        expect(mocks.budget).toHaveBeenCalledWith("business-a");
        expect(mocks.generate).toHaveBeenCalledWith(expect.stringContaining("Good service"), expect.objectContaining({ maxOutputTokens: 1024 }));
        expect(mocks.set).toHaveBeenLastCalledWith(expect.stringContaining("widget_summary_v1:example:google:"), expect.objectContaining({ reviewCount: 5 }), { ex: 2592000 });
    });
    it("does not publish a result if reviews change or write permission is revoked during generation", async () => {
        mocks.load.mockResolvedValueOnce({ kind: "ok", formattedReviews: reviews }).mockResolvedValueOnce({ kind: "ok", formattedReviews: reviews.slice(1) });
        expect((await handleWidgetSummaryPost(request())).status).toBe(409);
        expect(mocks.set).toHaveBeenCalledTimes(1);
        vi.clearAllMocks(); mocks.load.mockResolvedValue({ kind: "ok", formattedReviews: reviews }); mocks.access.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        expect((await handleWidgetSummaryPost(request())).status).toBe(403);
        expect(mocks.set).toHaveBeenCalledTimes(1);
    });
});
