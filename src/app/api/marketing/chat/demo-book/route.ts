import { handleDemoBook } from "@/services/support-chat/tools-api";

export async function POST(request: Request) {
    return handleDemoBook(request);
}
