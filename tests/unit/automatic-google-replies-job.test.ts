import { beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (context: { event: { data: { reviewId: string } }; step: { run: <T>(name: string, work: () => Promise<T>) => Promise<T> } }) => Promise<{ status: string; reason?: string }>;
const mocks = vi.hoisted(() => ({ single: vi.fn(), rpc: vi.fn(), quota: vi.fn(), draft: vi.fn(), publish: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_config: unknown, _event: unknown, handler: Handler) => handler } }));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn() } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }), rpc: mocks.rpc }) }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: mocks.quota }));
vi.mock("@/domains/ai/services/generate-reply-draft", () => ({ generateReplyDraftText: mocks.draft }));
vi.mock("@/services/reviews/post-google-reply-system", () => ({ postGoogleReplySystem: mocks.publish }));
import { processAutoReplyReview } from "@/services/inngest/functions/process-auto-reply-review-function";

function review() {
  return { id: "sample", platform: "google", rating: 5, text: "Great coffee", response_status: "pending", review_date: new Date().toISOString(), selected_staff: null,
    businesses: { id: "business", name: "Juniper", category: "cafe", organization_id: "org", auto_reply_enabled: true, auto_reply_enabled_at: new Date(Date.now() - 60_000).toISOString(), auto_reply_min_rating: 4, auto_reply_tone: "friendly", organizations: { id: "org", plan: "starter_monthly", plan_status: "active" } } };
}
const run = () => (processAutoReplyReview as unknown as Handler)({ event: { data: { reviewId: "sample" } }, step: { run: async (_name, work) => work() } });

describe("automatic Google replies entitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.single.mockResolvedValue({ data: review(), error: null });
    mocks.quota.mockResolvedValue({ allowed: false, current: 1500, max: 1500 });
    mocks.draft.mockResolvedValue("Thanks for visiting Juniper!");
    mocks.publish.mockResolvedValue(undefined);
    mocks.rpc.mockResolvedValue({ error: null });
  });
  it("publishes for an eligible paid business even when customer-draft quota is exhausted", async () => {
    expect(await run()).toEqual({ status: "completed", reviewId: "sample" });
    expect(mocks.publish).toHaveBeenCalledWith("sample", "Thanks for visiting Juniper!");
    expect(mocks.quota).not.toHaveBeenCalled();
  });
  it.each(["canceled", "past_due", "unpaid"])("does not generate or publish for a %s subscription", async status => {
    const row = review(); row.businesses.organizations.plan_status = status;
    mocks.single.mockResolvedValue({ data: row, error: null });
    expect(await run()).toMatchObject({ status: "skipped", reason: "plan_not_eligible" });
    expect(mocks.draft).not.toHaveBeenCalled();
    expect(mocks.publish).not.toHaveBeenCalled();
  });
  it.each(["disabled", "below-threshold", "facebook", "already-replied", "existing-review"])("preserves the %s safeguard", async scenario => {
    const row = review();
    if (scenario === "disabled") row.businesses.auto_reply_enabled = false;
    if (scenario === "below-threshold") row.rating = 3;
    if (scenario === "facebook") row.platform = "facebook";
    if (scenario === "already-replied") row.response_status = "responded";
    if (scenario === "existing-review") row.review_date = new Date(Date.now() - 86400_000).toISOString();
    mocks.single.mockResolvedValue({ data: row, error: null });
    expect(await run()).toMatchObject({ status: "skipped" });
    expect(mocks.publish).not.toHaveBeenCalled();
  });
});
