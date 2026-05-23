import { handleSuggestReply } from "@/services/ai/suggest-reply-api";

export async function POST(request: Request) {
    return handleSuggestReply(request);
}
