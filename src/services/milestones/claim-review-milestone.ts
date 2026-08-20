import type { SupabaseClient } from "@supabase/supabase-js";

import { isReviewMilestone } from "@/lib/milestones/review-milestones";

type ClaimResult = {
  data: unknown;
  error: { message?: string; code?: string } | null;
};

export class ClaimReviewMilestoneError extends Error {
  readonly kind: "unavailable" | "forbidden" | "failed";

  constructor(kind: ClaimReviewMilestoneError["kind"], message: string) {
    super(message);
    this.name = "ClaimReviewMilestoneError";
    this.kind = kind;
  }
}

function classifyRpcError(error: { message?: string; code?: string }): ClaimReviewMilestoneError {
  const message = error.message || "Failed to claim review milestone";
  const haystack = `${error.code ?? ""} ${message}`.toLowerCase();
  if (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    error.code === "42P01" ||
    haystack.includes("schema cache") ||
    haystack.includes("does not exist")
  ) {
    return new ClaimReviewMilestoneError("unavailable", message);
  }
  if (error.code === "42501" || haystack.includes("not authorized")) {
    return new ClaimReviewMilestoneError("forbidden", message);
  }
  return new ClaimReviewMilestoneError("failed", message);
}

export async function claimReviewMilestone(
  supabase: SupabaseClient,
  businessId: string,
): Promise<number | null> {
  const result = (await supabase.rpc(
    "claim_review_milestone" as never,
    { p_business_id: businessId } as never,
  )) as unknown as ClaimResult;

  if (result.error) {
    throw classifyRpcError(result.error);
  }
  return isReviewMilestone(result.data) ? result.data : null;
}
