import { handleClaimReviewMilestone } from "@/services/milestones/claim-review-milestone-api";

export async function POST(request: Request) {
  return handleClaimReviewMilestone(request);
}
