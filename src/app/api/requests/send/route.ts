export const dynamic = "force-dynamic";

import { handleSendReviewRequest } from "@/services/review-requests/api/send-request";

export async function POST(request: Request) {
  return handleSendReviewRequest(request);
}
