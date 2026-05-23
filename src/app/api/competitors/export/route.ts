export const dynamic = "force-dynamic";

import { handleCompetitorsExport } from "@/services/competitors/export-api";

export async function GET(request: Request) {
    return handleCompetitorsExport(request);
}
