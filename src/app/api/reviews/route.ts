import { handleReviewsList } from "@/services/reviews/reviews-list-api";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return handleReviewsList(request);
}
