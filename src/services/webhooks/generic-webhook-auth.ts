import { NextResponse, type NextRequest } from "next/server";
import { authenticateStoredApiKey } from "@/services/api-keys/authenticate-api-key";
import { withGenericWebhookCors } from "./generic-webhook-cors";

export async function authenticateGenericWebhookKey(req: NextRequest) {
    const auth = await authenticateStoredApiKey(req, "review_requests:write");
    if (auth.ok) return { ok: true as const, businessId: auth.businessId };

    const error = {
        url_key_rejected:
            "API keys in URLs are not accepted. Use the Authorization Bearer header.",
        unauthorized: "Missing or invalid API key. Use the Authorization Bearer header.",
        insufficient_scope: "API key lacks the required review-request scope.",
        rate_limited: "API rate limit exceeded.",
        authentication_unavailable: "API key authentication is temporarily unavailable.",
    }[auth.code];
    return {
        ok: false as const,
        response: withGenericWebhookCors(
            NextResponse.json({ success: false, error }, { status: auth.status }),
        ),
    };
}
