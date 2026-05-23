import { handleCompetitorsRangeDataGet } from "@/services/competitors/range-data-api";

export async function GET(request: Request) {
  return handleCompetitorsRangeDataGet(request);
}
