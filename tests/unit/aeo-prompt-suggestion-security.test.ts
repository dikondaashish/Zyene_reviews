import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ client: vi.fn(), admin: vi.fn(), access: vi.fn(), rate: vi.fn(), cooldown: vi.fn(),
    budget: vi.fn(), discover: vi.fn(), store: vi.fn(), token: vi.fn(),
    org: { plan: "starter", plan_status: "active" } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiRateLimit: { limit: mocks.rate }, aeoPromptSuggestionRateLimit: { limit: mocks.cooldown } }));
vi.mock("@/services/ai/ai-business-budget", () => ({ checkAiBusinessDailyBudget: mocks.budget }));
vi.mock("@/services/google/sync-service", () => ({ getValidGoogleToken: mocks.token }));
vi.mock("@/services/google/listing-information", () => ({ getGoogleLocation: async () => ({ categories: { primaryCategory: { displayName: "Dentist" } } }) }));
vi.mock("@/services/aeo/prompts/suggest-prompts", () => ({ suggestPrompts: () => [] }));
vi.mock("@/services/aeo/prompts/store-suggested-prompts", () => ({ storeSuggestedPrompts: mocks.store }));
vi.mock("@/services/aeo/prompts/discover-prompts", () => ({ discoverPromptsFromDemand: mocks.discover }));
vi.mock("@/services/google/performance-queries", () => ({ getGoogleSearchKeywords: async () => [{ keyword: "dentist", impressions: 10 }] }));
vi.mock("@/app/(dashboard)/google-seo-aeo/load-search-console-section", () => ({ loadSearchConsoleSection: async () => null }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
import { generateSuggestedPrompts } from "@/app/(dashboard)/google-seo-aeo/prompts/suggest-prompts-action";
const businessId = "10000000-0000-4000-8000-000000000001";

describe("AEO prompt suggestion paid work boundary", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.org = { plan: "starter", plan_status: "active" };
        mocks.client.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) }, from: (table: string) => {
            const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data:
                table === "businesses" ? { name: "Synthetic business", city: "Synthetic city", organization_id: "org-a" } :
                table === "organizations" ? mocks.org : { id: "platform-a", google_location_id: "location-a", granted_scopes: [] }, error: null }) };
            return query;
        } });
        mocks.access.mockResolvedValue(true); mocks.rate.mockResolvedValue({ success: true });
        mocks.cooldown.mockResolvedValue({ success: true }); mocks.budget.mockResolvedValue(null);
        mocks.token.mockResolvedValue({ accessToken: "synthetic-token" });
        mocks.discover.mockResolvedValue([]); mocks.store.mockResolvedValue({ inserted: 1, skippedAsDuplicate: 0 });
    });
    it.each(["foreign tenant", "sibling business", "viewer", "suspended user"])("denies %s before token or privileged access", async () => {
        mocks.access.mockResolvedValue(false);
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(false);
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), "user-a", businessId, true);
        expect(mocks.admin).not.toHaveBeenCalled();
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.discover).not.toHaveBeenCalled();
    });
    it.each(["free", "canceled"])("preserves deterministic suggestions but denies paid discovery on %s plans", async mode => {
        mocks.org = mode === "free" ? { plan: "free", plan_status: "active" } : { plan: "starter", plan_status: "canceled" };
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(true);
        expect(mocks.discover).not.toHaveBeenCalled();
        expect(mocks.store).toHaveBeenCalledTimes(1);
    });
    it("enforces a business-wide cooldown before provider/token calls", async () => {
        mocks.cooldown.mockResolvedValue({ success: false });
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(false);
        expect(mocks.cooldown).toHaveBeenCalledWith(businessId);
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.discover).not.toHaveBeenCalled();
    });
    it("fails closed on rate-limit outages", async () => {
        mocks.rate.mockRejectedValue(new Error("Synthetic outage"));
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(false);
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.discover).not.toHaveBeenCalled();
    });
    it("does not fall through to a model call when the daily budget is denied", async () => {
        mocks.budget.mockResolvedValue(new Response(null, { status: 503 }));
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(true);
        expect(mocks.discover).not.toHaveBeenCalled();
        expect(mocks.store).toHaveBeenCalledTimes(1);
    });
    it("preserves eligible discovery using verified business scope", async () => {
        expect((await generateSuggestedPrompts({ businessId })).ok).toBe(true);
        expect(mocks.budget).toHaveBeenCalledWith(businessId);
        expect(mocks.discover).toHaveBeenCalledTimes(1);
    });
});
