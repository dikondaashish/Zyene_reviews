import { handleOptimizeBusinessDescription } from "@/services/ai/optimize-business-description-api";

export async function POST(request: Request) {
    return handleOptimizeBusinessDescription(request);
}
