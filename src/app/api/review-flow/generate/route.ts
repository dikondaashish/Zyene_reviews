export const dynamic = "force-dynamic";

import { handleGenerateReviewFlow } from "@/services/review-flow/generate-review-api";

export async function POST(request: Request) {
  return handleGenerateReviewFlow(request);
}
