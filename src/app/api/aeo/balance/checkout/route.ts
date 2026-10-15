export const dynamic = "force-dynamic";

import { handleAeoTopupCheckout } from "@/services/aeo/billing/topup-checkout-api";

export async function POST(request: Request) {
    return handleAeoTopupCheckout(request);
}
