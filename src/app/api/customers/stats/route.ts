import { handleCustomersStats } from "@/services/customers/stats-api";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return handleCustomersStats(request);
}
