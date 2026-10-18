import { handleReplyFeedback } from "@/services/support-chat/tools-api";

export async function POST(request: Request) {
    return handleReplyFeedback(request);
}
