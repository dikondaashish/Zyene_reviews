import { handleOptimizeGbpContent } from "@/services/ai/optimize-gbp-content-api";

export async function POST(request: Request) {
    return handleOptimizeGbpContent(request);
}
