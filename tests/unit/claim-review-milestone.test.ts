import { describe, expect, it, vi } from "vitest";

import {
  ClaimReviewMilestoneError,
  claimReviewMilestone,
} from "@/services/milestones/claim-review-milestone";

const businessId = "22222222-2222-4222-8222-222222222222";

function supabaseWithRpc(result: { data?: unknown; error: { message?: string; code?: string } | null }) {
  return { rpc: vi.fn().mockResolvedValue(result) };
}

describe("claimReviewMilestone", () => {
  it("returns the claimed milestone when the RPC succeeds", async () => {
    const supabase = supabaseWithRpc({ data: 50, error: null });
    await expect(claimReviewMilestone(supabase as never, businessId)).resolves.toBe(50);
  });

  it("returns null when the business has no new configured milestone", async () => {
    const supabase = supabaseWithRpc({ data: null, error: null });
    await expect(claimReviewMilestone(supabase as never, businessId)).resolves.toBeNull();
  });

  it("marks a missing RPC as unavailable instead of a generic failure", async () => {
    const supabase = supabaseWithRpc({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.claim_review_milestone(p_business_id) in the schema cache",
      },
    });

    await expect(claimReviewMilestone(supabase as never, businessId)).rejects.toMatchObject({
      kind: "unavailable",
    } satisfies Partial<ClaimReviewMilestoneError>);
  });

  it("marks SQL authorization failures as forbidden", async () => {
    const supabase = supabaseWithRpc({
      data: null,
      error: { code: "42501", message: "Not authorized for this business" },
    });

    await expect(claimReviewMilestone(supabase as never, businessId)).rejects.toMatchObject({
      kind: "forbidden",
    } satisfies Partial<ClaimReviewMilestoneError>);
  });
});
