import { handleSuggestQaAnswer } from "@/services/ai/suggest-qa-answer-api";

export async function POST(request: Request) {
    return handleSuggestQaAnswer(request);
}
