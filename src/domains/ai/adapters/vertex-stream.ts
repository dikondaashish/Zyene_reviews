import type { GenerateContentResponse } from "@google/genai";

import {
    apiKeyClient,
    DEFAULT_FALLBACK_MODEL,
    DEFAULT_PRIMARY_MODEL,
    isBlockedApiKeyError,
    vertexClient,
} from "@/domains/ai/adapters/vertex-clients";
import { logger } from "@/lib/logger";

export interface VertexStreamOptions {
    systemInstruction?: string;
    maxOutputTokens?: number;
    temperature?: number;
}

async function openStream(model: string, prompt: string, config: Record<string, unknown>) {
    const request = { model, contents: [{ role: "user", parts: [{ text: prompt }] }], config };
    if (apiKeyClient) {
        try {
            return await apiKeyClient.models.generateContentStream(request);
        } catch (error) {
            if (!isBlockedApiKeyError(error)) throw error;
            // API key path blocked; retry with Vertex auth.
        }
    }
    return vertexClient.models.generateContentStream(request);
}

function chunkText(chunk: GenerateContentResponse): string {
    const parts = chunk.candidates?.[0]?.content?.parts ?? [];
    return parts.map((part) => (typeof part.text === "string" && !part.thought ? part.text : "")).join("");
}

/**
 * Streams text chunks from Gemini. Falls back to the secondary model only if the
 * primary fails before producing any text; a mid-stream failure is rethrown so the
 * caller never shows a reply stitched together from two models.
 */
export async function* generateContentStreamWithFallback(
    prompt: string,
    options: VertexStreamOptions = {},
): AsyncGenerator<string> {
    const config: Record<string, unknown> = {};
    if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
    if (options.maxOutputTokens) config.maxOutputTokens = options.maxOutputTokens;
    if (typeof options.temperature === "number") config.temperature = options.temperature;

    const models = DEFAULT_FALLBACK_MODEL === DEFAULT_PRIMARY_MODEL
        ? [DEFAULT_PRIMARY_MODEL]
        : [DEFAULT_PRIMARY_MODEL, DEFAULT_FALLBACK_MODEL];

    for (const [attempt, model] of models.entries()) {
        let yielded = false;
        const started = Date.now();
        try {
            for await (const chunk of await openStream(model, prompt, config)) {
                const text = chunkText(chunk);
                if (!text) continue;
                yielded = true;
                yield text;
            }
            logger.info({ model, latencyMs: Date.now() - started, fallback: attempt > 0 }, "[GEN AI SDK] stream success");
            return;
        } catch (error) {
            logger.error({ err: error, model }, "[GEN AI SDK] stream failed");
            if (yielded || attempt === models.length - 1) throw error;
        }
    }
}
