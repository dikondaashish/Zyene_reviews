import { handleDecideReplyApproval } from "@/services/reviews/reply-approvals-api";

export const dynamic = "force-dynamic";

/** Approve (optionally edited) and post, or reject, one reply draft. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleDecideReplyApproval(request, id);
}
