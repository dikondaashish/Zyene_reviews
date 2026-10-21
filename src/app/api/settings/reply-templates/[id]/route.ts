import { handleDeleteReplyTemplate, handleUpdateReplyTemplate } from "@/services/reviews/reply-templates-api";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleUpdateReplyTemplate(request, id);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return handleDeleteReplyTemplate(id);
}
