import { handleReviewsExport } from "@/services/reviews/export-api";

export async function GET(request: Request) {
    return handleReviewsExport(request);
}
