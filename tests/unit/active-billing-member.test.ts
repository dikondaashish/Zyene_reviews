import { beforeEach, describe, expect, it, vi } from "vitest";

const query = {
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
};
const admin = { from: vi.fn(() => query) };

vi.mock("@/lib/auth/business-context", () => ({
  getActiveBusinessId: vi.fn(async () => ({
    organization: { id: "org-active" },
  })),
}));
vi.mock("@/lib/db/supabase/admin", () => ({
  createAdminClient: vi.fn(() => admin),
}));

describe("active billing membership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({
      data: {
        organization_id: "org-active",
        role: "owner",
        organizations: { id: "org-active" },
      },
      error: null,
    });
  });

  it("scopes every billing action to the organization selected in the app", async () => {
    const { loadActiveBillingMember } =
      await import("../../src/lib/billing/active-billing-member");

    const result = await loadActiveBillingMember("user-1");

    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-active");
    expect(query.eq).toHaveBeenCalledWith("status", "active");
    expect(query.maybeSingle).toHaveBeenCalledOnce();
    expect(result.kind).toBe("ok");
  });
});
