export const dynamic = "force-dynamic";

import { handleBillingCheckout } from "@/services/stripe/checkout-api";

export async function POST(request: Request) {
  return handleBillingCheckout(request);
}
