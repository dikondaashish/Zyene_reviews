export const dynamic = "force-dynamic";

import { handleResendWebhook } from "@/services/webhooks/resend-api";

export async function POST(request: Request) {
    return handleResendWebhook(request);
}
