import type { SupabaseClient } from "@supabase/supabase-js";

import { isReviewMilestone } from "@/lib/milestones/review-milestones";

type ClaimResult = { data: unknown; error: { message?: string } | null };

export async function claimReviewMilestone(
  supabase: SupabaseClient,
  businessId: string,
): Promise<number | null> {
  const result = (await supabase.rpc(
    "claim_review_milestone" as never,
    { p_business_id: businessId } as never,
  )) as unknown as ClaimResult;

  if (result.error) {
    throw new Error(result.error.message || "Failed to claim review milestone");
  }
  return isReviewMilestone(result.data) ? result.data : null;
}
