import { GoogleGenAI } from "@google/genai";

import { getEngineDescriptor } from "../engine-catalog";
import {
    citationsPresent,
    citationsUnavailable,
    engineError,
    failedSample,
    noAnswerSample,
    okSample,
} from "../engine-result";
import type {
    AnswerEngineAdapter,
    EngineErrorKind,
    EngineSampleRequest,
    EngineSampleResult,
} from "../engine-types";

import { buildLocalePrompt } from "./adapter-support";

/**
 * Gemini via the Generative Language API, with Google Search grounding.
 *
 * The FIRST adapter in this module that can spend money, so a few things are
 * deliberate rather than incidental:
 *
 * - The model is read from the catalog, never hardcoded here and never inherited
 *   from the app-wide default in vertex-adapter.ts. The catalog entry is what the
 *   written price quote is attached to; a model chosen anywhere else would be
 *   priced against a rate that does not cover it.
 * - Its own API key (AEO_GEMINI_API_KEY), not the shared GOOGLE_VERTEX_API_KEY.
 *   The free grounding bucket is per billing project and aeo_reserve_quota
 *   assumes it owns all of it. A shared key would let other features drain the
 *   allowance without ever reaching the ledger.
 * - Grounding is always on. An ungrounded answer is a different product — it
 *   reflects training data rather than what the engine says about a business
 *   today — and it would also be billed under a different line of the quote.
 */

/** One grounded prompt = one unit of the daily allowance, however many searches it fans out to. */
const UNITS_PER_GROUNDED_PROMPT = 1;

const DEFAULT_TIMEOUT_MS = 60_000;

export type GeminiEngineAdapterOptions = {
    apiKey?: string;
    timeoutMs?: number;
};

export class GeminiEngineAdapter implements AnswerEngineAdapter {
    readonly id = "gemini" as const;
    readonly modelId: string;

    private readonly apiKey: string | null;
    private readonly timeoutMs: number;
    private client: GoogleGenAI | null = null;

    constructor(options: GeminiEngineAdapterOptions = {}) {
        const pinned = getEngineDescriptor("gemini").pinnedModelId;
        if (!pinned) {
            // Belt and braces: an unpinned entry would mean the cost model has no
            // model to attach to, which is the state this field exists to prevent.
            throw new Error("Gemini catalog entry has no pinnedModelId");
        }
        this.modelId = pinned;
        this.apiKey = options.apiKey?.trim() || process.env.AEO_GEMINI_API_KEY?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    }

    isConfigured(): boolean {
        return this.apiKey !== null;
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        const started = Date.now();
        const elapsed = () => Date.now() - started;

        if (!this.apiKey) {
            // Never reached through resolveRunnable, which withholds unconfigured
            // engines. Handled anyway so a direct caller cannot get a silent null.
            return failedSample({
                modelId: null,
                error: engineError("auth", "AEO_GEMINI_API_KEY is not set"),
                latencyMs: elapsed(),
            });
        }

        this.client ??= new GoogleGenAI({ apiKey: this.apiKey });

        const timeout = AbortSignal.timeout(this.timeoutMs);
        const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;

        try {
            const response = await this.client.models.generateContent({
                model: this.modelId,
                contents: buildLocalePrompt(request),
                config: {
                    tools: [{ googleSearch: {} }],
                    abortSignal: abort,
                },
            });

            const candidate = response.candidates?.[0];
            const meta = candidate?.groundingMetadata;
            const text = response.text?.trim() ?? "";

            // A grounded call consumes its unit whether or not we liked the
            // answer, so cost is recorded on every non-failed outcome. Reporting
            // 0 here would undercount the allowance — the self-amplifying error
            // the ledger is built to avoid.
            const costUnits = UNITS_PER_GROUNDED_PROMPT;

            if (!text) {
                return noAnswerSample({
                    modelId: this.modelId,
                    reason: candidate?.finishReason
                        ? `empty response (finishReason: ${candidate.finishReason})`
                        : "empty response",
                    latencyMs: elapsed(),
                    costUnits,
                });
            }

            return okSample({
                modelId: this.modelId,
                answerText: text,
                // Tri-state matters here. `meta` absent means the search tool did
                // not run, so this answer genuinely has no sources to expose and
                // must stay out of the citation-rate denominator. `meta` present
                // with zero chunks is a real zero and counts.
                citations: meta
                    ? citationsPresent(
                          (meta.groundingChunks ?? [])
                              .map((chunk) => ({
                                  url: chunk.web?.uri ?? "",
                                  title: chunk.web?.title ?? null,
                              }))
                              .filter((c) => c.url.length > 0)
                      )
                    : citationsUnavailable(),
                latencyMs: elapsed(),
                costUnits,
            });
        } catch (error) {
            return failedSample({
                modelId: this.modelId,
                error: classify(error),
                latencyMs: elapsed(),
                // Whether a rejected request consumed a grounding unit is not
                // observable from the error. Charged as 0 because settlement can
                // correct an undercount from the invoice, whereas a phantom unit
                // silently shrinks the allowance for work that never happened.
                costUnits: 0,
            });
        }
    }
}

function classify(error: unknown): ReturnType<typeof engineError> {
    const message = error instanceof Error ? error.message : String(error);
    const status = extractStatus(message);

    // Ordered most specific first. Retryability is decided by engineError from
    // the kind alone, so an adapter cannot mark a permanent failure retryable
    // and spin a run against a wall.
    let kind: EngineErrorKind = "unknown";
    if (/abort|timed? ?out/i.test(message)) kind = "timeout";
    else if (status === 429) kind = "rate_limited";
    else if (status === 401 || status === 403) kind = "auth";
    else if (status === 400 || status === 404) kind = "invalid_request";
    else if (status !== null && status >= 500) kind = "upstream_unavailable";
    else if (/quota|exhausted/i.test(message)) kind = "quota_exhausted";

    return engineError(kind, message.slice(0, 500), extractRetryAfterMs(message));
}

function extractStatus(message: string): number | null {
    const match = message.match(/"code"\s*:\s*(\d{3})/) ?? message.match(/\b(4\d{2}|5\d{2})\b/);
    return match ? Number(match[1]) : null;
}

function extractRetryAfterMs(message: string): number | undefined {
    const match = message.match(/retry(?:Delay|-after)"?[:\s]+"?(\d+)(s|ms)?/i);
    if (!match) return undefined;
    const value = Number(match[1]);
    return match[2] === "ms" ? value : value * 1000;
}
