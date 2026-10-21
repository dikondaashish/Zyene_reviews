import { handleListReplyApprovals } from "@/services/reviews/reply-approvals-api";

export const dynamic = "force-dynamic";

/** Pending and failed reply drafts awaiting approval for a business. */
export async function GET(request: Request) {
    return handleListReplyApprovals(request);
}
