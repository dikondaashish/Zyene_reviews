import { handleConfirmReview } from "@/services/review-requests/confirm-review-api";

export const dynamic = "force-dynamic";

/** Mark (or unmark) a review request as having a confirmed public review. Manual confirmation. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleConfirmReview(request, id);
}
