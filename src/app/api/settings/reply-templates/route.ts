import { handleCreateReplyTemplate } from "@/services/reviews/reply-templates-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    return handleCreateReplyTemplate(request);
}
