import { handleCreateImport, handleListImports } from "@/services/enrollment/imports-api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Gradual CSV enrollment for a campaign: list progress, or upload a validated file. */
export async function GET(_request: Request, { params }: Ctx) {
    return handleListImports((await params).id);
}

export async function POST(request: Request, { params }: Ctx) {
    return handleCreateImport(request, (await params).id);
}
