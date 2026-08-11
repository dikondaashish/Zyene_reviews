export const dynamic = "force-dynamic";

import { handlePromptsExport } from "@/services/aeo/reporting/export-prompts";

export async function GET(request: Request) {
    return handlePromptsExport(request);
}
