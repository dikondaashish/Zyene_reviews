import { handleAiInsights } from "@/services/ai/ai-insights-api";

export async function GET(request: Request) {
    return handleAiInsights(request);
}
