import { logger } from "@/lib/logger";
import type { Schema } from "@google/genai";
import {
    apiKeyClient,
    DEFAULT_FALLBACK_MODEL,
    DEFAULT_PRIMARY_MODEL,
    isBlockedApiKeyError,
    vertexClient,
} from "@/domains/ai/adapters/vertex-clients";

export interface VertexGenerationOptions {
    requireJson?: boolean;
    schema?: Schema;
    /** Kept for API compatibility; all tiers use primary (Flash) then fallback (Pro) unless env overrides. */
    isPremium?: boolean;
    enableGrounding?: boolean;
    /** Caps generation length - lowers latency for short outputs (e.g. suggest reply). */
    maxOutputTokens?: number;
    /** Lower = faster, more deterministic (e.g. 0.45-0.65 for replies). */
    temperature?: number;
    /** Use this model id instead of GOOGLE_AI_PRIMARY_MODEL for this call only. */
    modelOverride?: string;
    /** Trusted instructions kept apart from untrusted user text in `prompt`. */
    systemInstruction?: string;
}

export async function generateContentWithFallback(
    prompt: string,
    options: VertexGenerationOptions = {}
): Promise<string> {
    const {
        requireJson = false,
        schema,
        enableGrounding = false,
        maxOutputTokens,
        temperature,
        modelOverride,
        systemInstruction,
    } = options;

    const primaryModel = modelOverride?.trim() || DEFAULT_PRIMARY_MODEL;
    const fallbackModel = DEFAULT_FALLBACK_MODEL;

    const config: Record<string, unknown> = {};

    if (enableGrounding) {
        config.tools = [{ googleSearch: {} }];
    }

    if (requireJson) {
        config.responseMimeType = "application/json";
    }
    if (schema) {
        config.responseSchema = schema;
    }
    if (typeof maxOutputTokens === "number" && maxOutputTokens > 0) {
        config.maxOutputTokens = maxOutputTokens;
    }
    if (typeof temperature === "number") {
        config.temperature = temperature;
    }
    if (systemInstruction) {
        config.systemInstruction = systemInstruction;
    }

    const startTime = Date.now();

    try {
        const response = await callModelWithClientFallback(primaryModel, prompt, config);

        const latencyMs = Date.now() - startTime;
        const returnedText = readResponseText(response);

        if (returnedText) {
            logger.info({ model: primaryModel, latencyMs }, "[GEN AI SDK] success");
            return returnedText || "";
        }

        return "";
    } catch (error) {
        const latencyMs = Date.now() - startTime;
        logger.error({ err: error }, `[GEN AI SDK] model=${primaryModel} latency=${latencyMs}ms status=error`);

        // Model fallback strategy for transient model/permission rollout issues.
        if (fallbackModel !== primaryModel) {
            const fallbackStart = Date.now();

            try {
                const backupResponse = await callModelWithClientFallback(fallbackModel, prompt, config);

                const fallbackLatency = Date.now() - fallbackStart;
                const backupText = readResponseText(backupResponse);
                logger.info(
                    { model: fallbackModel, latencyMs: fallbackLatency, fallback: true },
                    "[GEN AI SDK] success",
                );

                return backupText;
            } catch (fallbackError) {
                logger.error({ err: fallbackError }, `[GEN AI SDK] Fallback failed:`);
                throw fallbackError;
            }
        }

        throw error;
    }
}

function readResponseText(response: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; text?: string } | null): string {
    if (!response) return "";
    const parts = response.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts.length > 0) {
        const joined = parts
            .map((p: { text?: string }) => (typeof p?.text === "string" ? p.text : ""))
            .join("");
        if (joined.trim()) return joined.trim();
    }
    if (typeof response.text === "string" && response.text.trim()) return response.text.trim();
    return "";
}

async function callModelWithClientFallback(model: string, prompt: string, config: Record<string, unknown>) {
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
            // API key path blocked; retry with Vertex auth
        }
    }

    return vertexClient.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config
    });
}

export { nextResponseForVertexAiError } from "@/domains/ai/adapters/vertex-ai-error-response";
