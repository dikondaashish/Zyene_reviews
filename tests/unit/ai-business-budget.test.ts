import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiBusinessDailyRateLimit: { limit: mocks.limit } }));

import { checkAiBusinessDailyBudget } from "@/services/ai/ai-business-budget";

describe("authenticated AI business budget", () => {
    beforeEach(() => vi.clearAllMocks());

    it("allows a business with budget remaining", async () => {
        mocks.limit.mockResolvedValue({ success: true });
        expect(await checkAiBusinessDailyBudget("business-a")).toBeNull();
        expect(mocks.limit).toHaveBeenCalledWith("business-a");
    });

    it("denies a spent business regardless of which user requests generation", async () => {
        mocks.limit.mockResolvedValue({ success: false });
        expect((await checkAiBusinessDailyBudget("business-a"))?.status).toBe(429);
    });

    it("fails closed when Redis cannot enforce the budget", async () => {
        mocks.limit.mockRejectedValue(new Error("Redis unavailable"));
        expect((await checkAiBusinessDailyBudget("business-a"))?.status).toBe(503);
    });

    it("guards every authenticated on-demand AI generator", () => {
        for (const file of [
            "suggest-reply-api.ts", "suggest-qa-answer-api.ts", "ai-insights-api.ts",
            "optimize-business-description-api.ts", "optimize-gbp-content-api.ts",
        ]) {
            const source = readFileSync(join(process.cwd(), "src/services/ai", file), "utf8");
            expect(source).toContain("checkAiBusinessDailyBudget(businessId)");
        }
    });
});
