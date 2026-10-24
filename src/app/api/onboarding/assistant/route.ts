import { handleSetupAssistantPost } from "@/services/support-chat/setup-assistant-api";

export const maxDuration = 30;

export async function POST(request: Request) {
    return handleSetupAssistantPost(request);
}
