import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    client: vi.fn(), access: vi.fn(), rate: vi.fn(), quota: vi.fn(), budget: vi.fn(),
    generate: vi.fn(), record: vi.fn(), rows: [] as unknown[],
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiRateLimit: { limit: mocks.rate } }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: mocks.quota }));
vi.mock("@/services/ai/ai-business-budget", () => ({ checkAiBusinessDailyBudget: mocks.budget }));
vi.mock("@/services/ai/record-reply-usage", () => ({ recordAiReplyUsage: mocks.record }));
vi.mock("@/lib/logger", () => ({ createRequestLogger: () => ({ requestId: "synthetic", logger: { info: vi.fn() } }) }));
vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({
    generateContentWithFallback: mocks.generate,
    nextResponseForVertexAiError: () => new Response(null, { status: 503 }),
}));
import { handleSuggestQaAnswer } from "@/services/ai/suggest-qa-answer-api";

describe("AI Q&A spend and accounting", () => {
    const request = () => new Request("https://example.test/api/ai/suggest-qa-answer", {
        method: "POST", body: JSON.stringify({ questionId: "10000000-0000-4000-8000-000000000001" }),
    });
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.rows = [
            { business_id: "business-a", question_text: "Opening hours?" },
            { organization_id: "org-a", name: "Synthetic business", knowledge_base: null },
            { plan: "starter", plan_status: "active", ai_replies_used_this_month: 0 },
        ];
        mocks.client.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) },
            from: () => {
                const query = { select: () => query, eq: () => query,
                    single: async () => ({ data: mocks.rows.shift(), error: null }) };
                return query;
            },
        });
        mocks.rate.mockResolvedValue({ success: true });
        mocks.access.mockResolvedValue(true);
        mocks.quota.mockResolvedValue({ allowed: true });
        mocks.budget.mockResolvedValue(null);
        mocks.generate.mockResolvedValue('{"answer":"We open at 9."}');
        mocks.record.mockResolvedValue(undefined);
    });
    it("denies a foreign business before provider or privileged accounting", async () => {
        mocks.access.mockResolvedValue(false);
        expect((await handleSuggestQaAnswer(request())).status).toBe(403);
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(mocks.record).not.toHaveBeenCalled();
    });
    it("denies an exhausted monthly quota before paid provider work", async () => {
        mocks.quota.mockResolvedValue({ allowed: false });
        expect((await handleSuggestQaAnswer(request())).status).toBe(403);
        expect(mocks.quota).toHaveBeenCalledWith("org-a", "smart_replies");
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(mocks.record).not.toHaveBeenCalled();
    });
    it("records successful structured generation", async () => {
        expect((await handleSuggestQaAnswer(request())).status).toBe(200);
        expect(mocks.record).toHaveBeenCalledWith(expect.anything(), "business-a");
    });
    it("also records the successful plain-text fallback", async () => {
        mocks.generate.mockResolvedValue("  We open at 9.  ");
        const response = await handleSuggestQaAnswer(request());
        expect((await response.json()).data.answer).toBe("We open at 9.");
        expect(mocks.record).toHaveBeenCalledTimes(1);
    });
});
