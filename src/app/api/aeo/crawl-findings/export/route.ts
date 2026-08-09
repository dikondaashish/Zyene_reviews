export const dynamic = "force-dynamic";

import { handleCrawlFindingsExport } from "@/services/aeo/crawler/export-crawl-findings";

export async function GET(request: Request) {
    return handleCrawlFindingsExport(request);
}
