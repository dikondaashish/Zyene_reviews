import { handlePrivateFeedbackPost } from "@/services/reviews/private-feedback-api";

export async function POST(request: Request) {
    return handlePrivateFeedbackPost(request);
}
