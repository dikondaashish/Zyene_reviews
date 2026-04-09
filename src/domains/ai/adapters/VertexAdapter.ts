import { GoogleGenAI } from "@google/genai";

const projectId = process.env.GCP_PROJECT_ID || "zyene-reviews";
const location = process.env.GCP_REGION || "global";
const apiKey = process.env.GOOGLE_VERTEX_API_KEY;

/**
 * Initialize the GoogleGenAI client.
 * Priority: 
 * 1. API Key (Express Mode for Vertex AI)
 * 2. Service Account (Standard Vertex AI Mode via ADC)
 */
const client = new GoogleGenAI(
    apiKey
        ? { apiKey }
        : {
            vertexai: true,
            project: projectId,
            location: location
        }
);

export interface VertexGenerationOptions {
    requireJson?: boolean;
    schema?: any;
    isPremium?: boolean;
    enableGrounding?: boolean;
}

export async function generateContentWithFallback(
    prompt: string,
    options: VertexGenerationOptions = {}
): Promise<string> {
    const { requireJson = false, schema, isPremium = false, enableGrounding = false } = options;

    const modelToUse = isPremium ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";

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
        const response = await client.models.generateContent({
            model: modelToUse,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config
        });

        const latencyMs = Date.now() - startTime;

        if (response && response.candidates && response.candidates.length > 0) {
            const returnedText = response.candidates[0]?.content?.parts?.[0]?.text;
            console.info(`[GEN AI SDK] model=${modelToUse} latency=${latencyMs}ms status=success`);
            return returnedText || "";
        }

        console.warn(`[GEN AI SDK] model=${modelToUse} latency=${latencyMs}ms status=empty_response`);
        return "";
    } catch (error) {
        const latencyMs = Date.now() - startTime;
        console.error(`[GEN AI SDK] model=${modelToUse} latency=${latencyMs}ms status=error`, error);

        // Fallback Strategy: Pro → Flash
        if (modelToUse === "gemini-3.1-pro-preview") {
            console.warn(`[GEN AI SDK] Falling back from gemini-3.1-pro-preview to gemini-3-flash-preview`);
            const fallbackStart = Date.now();

            try {
                const backupResponse = await client.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config
                });

                const fallbackLatency = Date.now() - fallbackStart;
                console.info(`[GEN AI SDK] model=gemini-3-flash-preview(fallback) latency=${fallbackLatency}ms status=success`);

                return backupResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
            } catch (fallbackError) {
                console.error(`[GEN AI SDK] Fallback failed:`, fallbackError);
                throw fallbackError;
            }
        }

        throw error;
    }
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
