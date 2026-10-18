import { logger } from "@/lib/logger";

/**
 * Maps GenAI SDK errors to appropriate HTTP responses.
 */
export function nextResponseForVertexAiError(
    error: unknown,
    genericUserMessage: string
): Response {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ err: msg }, "[GEN AI SDK ERROR]");

    // Auth / Permission Errors
    if (msg.includes("API_KEY_SERVICE_BLOCKED")) {
        return new Response(
            JSON.stringify({
                error: "AI key is blocked for Gemini API. Enable Gemini API access or use Vertex service account credentials.",
                code: "API_KEY_SERVICE_BLOCKED"
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    if (msg.includes("403") || /IAM|permission|unauthenticated|API_KEY_INVALID/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "AI service authentication failed. Please check your configuration.",
                code: "AI_AUTH_FAILED"
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    // Quota Errors
    if (msg.includes("429") || /resource_exhausted|quota|rate limit/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "AI quota exceeded. Please try again in a few minutes.",
                code: "QUOTA_EXCEEDED"
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
        );
    }

    // Model Not Found
    if (msg.includes("404") || /not found/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "The requested AI model is currently unavailable in this region.",
                code: "MODEL_NOT_FOUND"
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    // Generic Internal Error
    return new Response(
        JSON.stringify({ error: genericUserMessage }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
}
