import { beforeEach, describe, expect, it, vi } from "vitest";

const query = {
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
};

vi.mock("@/lib/db/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: vi.fn(() => query) })),
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: vi.fn() }));
vi.mock("@/lib/stripe/checkout-trial-eligibility", () => ({
  isEligibleForIntroTrial: vi.fn(),
}));
vi.mock("@/services/stripe/organization-billing-sync", () => ({
  reconcileOrganizationBillingFromStripe: vi.fn(),
}));

describe("billing membership lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("filters membership by the active organization before selecting one row", async () => {
    const { loadBillingPageData } =
      await import("../../src/app/(dashboard)/settings/billing/load-billing-page-data");

    await loadBillingPageData("user-1", "org-active");

    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-active");
    expect(query.maybeSingle).toHaveBeenCalledOnce();
  });
});
