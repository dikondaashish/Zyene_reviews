import { handleSmartAnalyzeBackfill } from "@/services/smart/analyze-backfill-api";

export async function POST(request: Request) {
    return handleSmartAnalyzeBackfill(request);
}
