import { handleSupportChatLeadPost } from "@/services/support-chat/lead-api";

export async function POST(request: Request) {
    return handleSupportChatLeadPost(request);
}
