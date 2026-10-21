import { handleUpdateImport } from "@/services/enrollment/imports-api";

export const dynamic = "force-dynamic";

/** Pause, resume, cancel, or change the daily limit of one import. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; importId: string }> }) {
    const { id, importId } = await params;
    return handleUpdateImport(request, id, importId);
}
