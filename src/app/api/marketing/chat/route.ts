import { handleSupportChatPost } from "@/services/support-chat/chat-api";

export const maxDuration = 30;

export async function POST(request: Request) {
    return handleSupportChatPost(request);
}
