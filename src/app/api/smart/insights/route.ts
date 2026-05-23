import { handleSmartInsightsGet } from "@/services/smart/insights-api";

export async function GET(request: Request) {
    return handleSmartInsightsGet(request);
}
