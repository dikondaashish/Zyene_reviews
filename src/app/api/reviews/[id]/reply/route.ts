import { handleReviewReplyDelete, handleReviewReplyPost } from "@/services/reviews/reply-api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleReviewReplyPost(request, id);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleReviewReplyDelete(_request, id);
}
