import { GoogleGenAI } from "@google/genai";

const projectId = process.env.GCP_PROJECT_ID || "zyene-reviews";
const location = process.env.GCP_REGION || "global";
const apiKey = process.env.GOOGLE_VERTEX_API_KEY;

/** Default: Gemini 3 Flash Preview (primary). Override with GOOGLE_AI_PRIMARY_MODEL. */
const DEFAULT_PRIMARY_MODEL = process.env.GOOGLE_AI_PRIMARY_MODEL || "gemini-3-flash-preview";
/** Default: Gemini 3.1 Pro Preview (fallback). Override with GOOGLE_AI_FALLBACK_MODEL. */
const DEFAULT_FALLBACK_MODEL = process.env.GOOGLE_AI_FALLBACK_MODEL || "gemini-3.1-pro-preview";

/**
 * Initialize the GoogleGenAI client.
 * Priority: 
 * 1. API Key (Express Mode for Vertex AI)
 * 2. Service Account (Standard Vertex AI Mode via ADC)
 */
const apiKeyClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
const vertexClient = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location
});

export interface VertexGenerationOptions {
    requireJson?: boolean;
    schema?: any;
    /** Kept for API compatibility; all tiers use primary (Flash) then fallback (Pro) unless env overrides. */
    isPremium?: boolean;
    enableGrounding?: boolean;
}

export async function generateContentWithFallback(
    prompt: string,
    options: VertexGenerationOptions = {}
): Promise<string> {
    const { requireJson = false, schema, enableGrounding = false } = options;

    const primaryModel = DEFAULT_PRIMARY_MODEL;
    const fallbackModel = DEFAULT_FALLBACK_MODEL;

    // Config configuration
    const config: any = {};

    if (enableGrounding) {
        config.tools = [{ googleSearch: {} }];
    }

    if (requireJson) {
        config.responseMimeType = "application/json";
    }
    if (schema) {
        config.responseSchema = schema;
    }

    const startTime = Date.now();

    try {
        const response = await callModelWithClientFallback(primaryModel, prompt, config);

        const latencyMs = Date.now() - startTime;
        const returnedText = readResponseText(response);

        if (returnedText) {
            console.info(`[GEN AI SDK] model=${primaryModel} latency=${latencyMs}ms status=success`);
            return returnedText || "";
        }

        console.warn(`[GEN AI SDK] model=${primaryModel} latency=${latencyMs}ms status=empty_response`);
        return "";
    } catch (error) {
        const latencyMs = Date.now() - startTime;
        console.error(`[GEN AI SDK] model=${primaryModel} latency=${latencyMs}ms status=error`, error);

        // Model fallback strategy for transient model/permission rollout issues.
        if (fallbackModel !== primaryModel) {
            console.warn(`[GEN AI SDK] Falling back from ${primaryModel} to ${fallbackModel}`);
            const fallbackStart = Date.now();

            try {
                const backupResponse = await callModelWithClientFallback(fallbackModel, prompt, config);

                const fallbackLatency = Date.now() - fallbackStart;
                const backupText = readResponseText(backupResponse);
                console.info(`[GEN AI SDK] model=${fallbackModel}(fallback) latency=${fallbackLatency}ms status=success`);

                return backupText;
            } catch (fallbackError) {
                console.error(`[GEN AI SDK] Fallback failed:`, fallbackError);
                throw fallbackError;
            }
        }

        throw error;
    }
}

function readResponseText(response: any): string {
    if (!response) return "";
    if (typeof response.text === "string" && response.text.trim()) return response.text.trim();
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function isBlockedApiKeyError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes("API_KEY_SERVICE_BLOCKED") || msg.includes("generativelanguage.googleapis.com");
}

async function callModelWithClientFallback(model: string, prompt: string, config: any) {
    if (apiKeyClient) {
        try {
            return await apiKeyClient.models.generateContent({
                model,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config
            });
        } catch (error) {
            if (!isBlockedApiKeyError(error)) {
                throw error;
            }
            console.warn(`[GEN AI SDK] API key path blocked for ${model}; retrying with Vertex auth.`);
        }
    }

    return vertexClient.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config
    });
}

/**
 * Maps GenAI SDK errors to appropriate HTTP responses.
 */
export function nextResponseForVertexAiError(
    error: unknown,
    genericUserMessage: string
): Response {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[GEN AI SDK ERROR]", msg);

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
