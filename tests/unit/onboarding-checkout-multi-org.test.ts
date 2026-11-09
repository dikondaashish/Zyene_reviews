import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
  retrieveSession: vi.fn(),
  loadActiveBillingMember: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/services/stripe/client", () => ({
  stripe: { checkout: { sessions: { retrieve: mocks.retrieveSession } } },
}));
vi.mock("@/lib/billing/active-billing-member", () => ({
  loadActiveBillingMember: mocks.loadActiveBillingMember,
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));

import { finalizeOnboardingStripeCheckout } from "@/app/actions/onboarding/billing";

const USER = "user-1";

function seed(): FakeDb {
  const db = createFakeDb({
    // Two active orgs (org-a listed first) plus one the user has left.
    organization_members: [
      { organization_id: "org-a", user_id: USER, role: "owner", status: "active" },
      { organization_id: "org-b", user_id: USER, role: "owner", status: "active" },
      { organization_id: "org-c", user_id: USER, role: "owner", status: "removed" },
      { organization_id: "org-d", user_id: "someone-else", role: "owner", status: "active" },
    ],
    users: [{ id: USER, onboarding_step: 4 }],
  });
  mocks.createClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: USER } } }) },
    from: (table: string) => db.client.from(table),
  });
  return db;
}

function completeSession(orgId: string | undefined, status = "trialing") {
  mocks.retrieveSession.mockResolvedValue({
    status: "complete",
    metadata: orgId ? { organization_id: orgId } : {},
    subscription: { id: "sub_123", status },
  });
}

const step = (db: FakeDb) => db.tables.users[0].onboarding_step;

describe("finalizeOnboardingStripeCheckout with several organizations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("advances onboarding for a checkout made for the user's second active org", async () => {
    const db = seed();
    completeSession("org-b");
    const result = await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" });
    expect(result.success).toBe(true);
    expect(result.trialEventId).toMatch(/^trial_[0-9a-f]{32}$/);
    expect(step(db)).toBe(7);
  });

  it("advances onboarding for the first active org too", async () => {
    const db = seed();
    completeSession("org-a", "active");
    const result = await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" });
    expect(result).toEqual({ success: true, trialEventId: undefined });
    expect(step(db)).toBe(7);
  });

  it("rejects a checkout for an org the user is no longer an active member of", async () => {
    const db = seed();
    completeSession("org-c");
    const result = await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" });
    expect(result).toMatchObject({ success: false, error: expect.stringMatching(/does not belong/) });
    expect(step(db)).toBe(4);
  });

  it("rejects a checkout for someone else's org (metadata alone is not trusted)", async () => {
    const db = seed();
    completeSession("org-d");
    expect((await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" })).success).toBe(false);
    expect(step(db)).toBe(4);
  });

  it("rejects a checkout session without an organization in its metadata", async () => {
    const db = seed();
    completeSession(undefined);
    expect((await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" })).success).toBe(false);
    expect(step(db)).toBe(4);
  });

  it("rejects an incomplete checkout session", async () => {
    const db = seed();
    mocks.retrieveSession.mockResolvedValue({ status: "open", metadata: { organization_id: "org-b" } });
    expect(await finalizeOnboardingStripeCheckout({ sessionId: "cs_1" })).toMatchObject({
      success: false,
      error: "Checkout is not complete.",
    });
    expect(step(db)).toBe(4);
  });

  it("confirms an in-place plan switch against the active (header-selected) org", async () => {
    const db = seed();
    mocks.loadActiveBillingMember.mockResolvedValue({
      kind: "ok",
      admin: {},
      member: {
        organization_id: "org-b",
        role: "owner",
        organizations: { id: "org-b", stripe_subscription_id: "sub_b" },
      },
    });
    expect(await finalizeOnboardingStripeCheckout({ planSwitchedOnly: true })).toMatchObject({ success: true });
    expect(mocks.loadActiveBillingMember).toHaveBeenCalledWith(USER);
    expect(step(db)).toBe(7);
  });

  it("does not confirm a plan switch when the active org has no subscription yet", async () => {
    const db = seed();
    mocks.loadActiveBillingMember.mockResolvedValue({
      kind: "ok",
      admin: {},
      member: { organization_id: "org-b", role: "owner", organizations: { id: "org-b", stripe_subscription_id: null } },
    });
    expect((await finalizeOnboardingStripeCheckout({ planSwitchedOnly: true })).success).toBe(false);
    expect(step(db)).toBe(4);
  });

  it("does not confirm a plan switch without an active organization", async () => {
    const db = seed();
    mocks.loadActiveBillingMember.mockResolvedValue({ kind: "no-active-organization" });
    expect(await finalizeOnboardingStripeCheckout({ planSwitchedOnly: true })).toMatchObject({
      success: false,
      error: "No organization found.",
    });
    expect(step(db)).toBe(4);
  });
});
