import { type NextRequest } from "next/server";
import { handleCustomersBulkPost } from "@/services/customers/bulk-api";

export async function POST(request: NextRequest) {
    return handleCustomersBulkPost(request);
}
