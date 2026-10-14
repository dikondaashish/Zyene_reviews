export const dynamic = "force-dynamic";

import { handleAeoBalance } from "@/services/aeo/billing/balance-api";

export async function GET() {
    return handleAeoBalance();
}
