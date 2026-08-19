/**
 * Generic incoming webhook (Zapier, Make, custom POS scripts).
 * Auth: `Authorization: Bearer <API_KEY>`. URL keys are rejected.
 */
import { type NextRequest } from "next/server";
import { handleGenericWebhookOptions, handleGenericWebhookPost } from "@/services/webhooks/generic-webhook-api";

export async function OPTIONS() {
    return handleGenericWebhookOptions();
}

export async function POST(req: NextRequest) {
    return handleGenericWebhookPost(req);
}
