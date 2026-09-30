import { handleReviewAnalysis } from "@/services/ai/review-analysis-api";

export async function POST(request: Request) {
    return handleReviewAnalysis(request);
}
