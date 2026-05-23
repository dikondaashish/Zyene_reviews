import { handleCustomersImport } from "@/services/customers/import-api";

export async function POST(req: Request) {
    return handleCustomersImport(req);
}
