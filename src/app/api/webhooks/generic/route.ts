/**
 * Generic incoming webhook (Zapier, Make, custom POS scripts).
 * Auth: Developer API key (zy_…). See generic-webhook-api service.
 */
import { type NextRequest } from "next/server";
import { handleGenericWebhookOptions, handleGenericWebhookPost } from "@/services/webhooks/generic-webhook-api";

export async function OPTIONS() {
    return handleGenericWebhookOptions();
}

export async function POST(req: NextRequest) {
    return handleGenericWebhookPost(req);
}
