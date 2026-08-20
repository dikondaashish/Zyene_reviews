import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  userCanAccessBusiness: vi.fn(),
  claimReviewMilestone: vi.fn(),
}));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({
  userCanAccessBusiness: mocks.userCanAccessBusiness,
}));
vi.mock("@/services/milestones/claim-review-milestone", async () => {
  const actual = await vi.importActual<typeof import("@/services/milestones/claim-review-milestone")>(
    "@/services/milestones/claim-review-milestone",
  );
  return { ...actual, claimReviewMilestone: mocks.claimReviewMilestone };
});

import { ClaimReviewMilestoneError } from "@/services/milestones/claim-review-milestone";
import { handleClaimReviewMilestone } from "@/services/milestones/claim-review-milestone-api";

const businessId = "22222222-2222-4222-8222-222222222222";
const user = { id: "33333333-3333-4333-8333-333333333333" };

function request(body: unknown) {
  return new Request("https://app.example.com/api/milestones/reviews/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("handleClaimReviewMilestone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    });
    mocks.userCanAccessBusiness.mockResolvedValue(true);
  });

  it("returns the claimed milestone", async () => {
    mocks.claimReviewMilestone.mockResolvedValue(100);
    const response = await handleClaimReviewMilestone(request({ businessId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: { milestone: 100 } });
  });

  it("returns no milestone when the RPC is missing instead of 500", async () => {
    mocks.claimReviewMilestone.mockRejectedValue(
      new ClaimReviewMilestoneError(
        "unavailable",
        "Could not find the function public.claim_review_milestone",
      ),
    );
    const response = await handleClaimReviewMilestone(request({ businessId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: { milestone: null } });
  });

  it("returns 401 when the caller is signed out", async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
    const response = await handleClaimReviewMilestone(request({ businessId }));
    expect(response.status).toBe(401);
    expect(mocks.claimReviewMilestone).not.toHaveBeenCalled();
  });
});
