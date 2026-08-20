export const dynamic = "force-dynamic";

import { handleNfcCheckout } from "@/services/nfc/checkout-api";

export async function POST(request: Request) {
    return handleNfcCheckout(request);
}
