export const dynamic = "force-dynamic";

import { handleCitationsExport } from "@/services/aeo/reporting/export-citations";

export async function GET(request: Request) {
    return handleCitationsExport(request);
}
