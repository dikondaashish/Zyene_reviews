export const dynamic = "force-dynamic";

import { handleStripeWebhook } from "@/services/stripe/webhook-handler";

export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
