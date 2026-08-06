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
    EngineSampleRequest,
    EngineSampleResult,
} from "../engine-types";
import { buildLocalePrompt, classifyHttpStatus, retryAfterMs } from "./adapter-support";

/**
 * ChatGPT via the OpenAI Responses API, with the hosted web_search tool.
 *
 * The most expensive engine per sample by a wide margin (~$0.025 against
 * Gemini's $0 inside its allowance), which shapes two decisions:
 *
 * - It is not in the default engine set. A run must ask for it.
 * - It has no free bucket, so E-10's budget guard deliberately does not gate it
 *   — blocking it would stop the product rather than protect an allowance.
 *   Affordability is the ledger's call, per reservation.
 *
 * Sends an Idempotency-Key. OpenAI honours it, so the crash-in-window case from
 * E-7 (request sent, process died before the response was durable) resolves to
 * the SAME billed request on retry rather than a second charge. This is the only
 * engine wired so far where that window can actually be closed rather than just
 * made visible.
 */

const UNITS_PER_REQUEST = 1;
const DEFAULT_TIMEOUT_MS = 90_000;
const API_URL = "https://api.openai.com/v1/responses";

type ResponsesPayload = {
    model?: string;
    status?: string;
    incomplete_details?: { reason?: string };
    output?: {
        type?: string;
        content?: {
            type?: string;
            text?: string;
            annotations?: { type?: string; url?: string; title?: string }[];
        }[];
    }[];
    /* Tokens are recorded by the API but deliberately not turned into a cost
     * figure here — see the note in sample(). */
};

export type ChatGptEngineAdapterOptions = {
    apiKey?: string;
    timeoutMs?: number;
    /**
     * Stable across retries of one dispatch unit. E-7 derives it from
     * (runId, promptId, engineId, attempt) — deterministic, no timestamp, so a
     * replay is recognised as the same request rather than a new one.
     */
    idempotencyKey?: string;
};

export class ChatGptEngineAdapter implements AnswerEngineAdapter {
    readonly id = "chatgpt" as const;
    readonly modelId: string;

    private readonly apiKey: string | null;
    private readonly timeoutMs: number;
    private readonly idempotencyKey?: string;

    constructor(options: ChatGptEngineAdapterOptions = {}) {
        const pinned = getEngineDescriptor("chatgpt").pinnedModelId;
        if (!pinned) throw new Error("ChatGPT catalog entry has no pinnedModelId");
        this.modelId = pinned;
        this.apiKey = options.apiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.idempotencyKey = options.idempotencyKey;
    }

    isConfigured(): boolean {
        return this.apiKey !== null;
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        const started = Date.now();
        const elapsed = () => Date.now() - started;

        if (!this.apiKey) {
            return failedSample({
                modelId: null,
                error: engineError("auth", "OPENAI_API_KEY is not set"),
                latencyMs: elapsed(),
            });
        }

        const timeout = AbortSignal.timeout(this.timeoutMs);
        const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;

        let response: Response;
        try {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    ...(this.idempotencyKey ? { "Idempotency-Key": this.idempotencyKey } : {}),
                },
                body: JSON.stringify({
                    model: this.modelId,
                    input: buildLocalePrompt(request),
                    tools: [{ type: "web_search" }],
                }),
                signal: abort,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return failedSample({
                modelId: this.modelId,
                error: engineError(
                    /abort|timed? ?out/i.test(message) ? "timeout" : "upstream_unavailable",
                    message
                ),
                latencyMs: elapsed(),
            });
        }

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            return failedSample({
                modelId: this.modelId,
                error: engineError(
                    classifyHttpStatus(response.status, body),
                    `HTTP ${response.status}: ${body.slice(0, 300)}`,
                    retryAfterMs(response)
                ),
                latencyMs: elapsed(),
                costUnits: 0,
            });
        }

        let payload: ResponsesPayload;
        try {
            payload = (await response.json()) as ResponsesPayload;
        } catch {
            return failedSample({
                modelId: this.modelId,
                error: engineError("upstream_unavailable", "response was not valid JSON"),
                latencyMs: elapsed(),
            });
        }

        const modelId = payload.model?.trim() || this.modelId;
        const message = payload.output?.find((o) => o.type === "message");
        const block = message?.content?.find((c) => c.type === "output_text");
        const text = block?.text?.trim() ?? "";
        // No reportedCostMicroUsd. OpenAI reports TOKENS, not money, and that
        // field means "what the vendor said this cost" — the invoice. Deriving a
        // figure from token counts and filing it there would make the ledger
        // treat an estimate as fact, which is the exact bug class this module
        // exists to eliminate. It would also be a systematic UNDERCOUNT, because
        // the per-call web_search fee is not itemised in the response — and
        // undercounting is the self-amplifying direction.
        //
        // Omitting it means the ledger falls back to the catalog rate, which is
        // honestly labelled `confidence: "estimated"`.

        if (!text) {
            return noAnswerSample({
                modelId,
                reason: payload.incomplete_details?.reason
                    ? `no output (${payload.incomplete_details.reason})`
                    : `no output (status: ${payload.status ?? "unknown"})`,
                latencyMs: elapsed(),
                costUnits: UNITS_PER_REQUEST,
            });
        }

        // url_citation annotations are attached to the text block. Their absence
        // means the model answered without searching — genuinely no sources to
        // expose for this sample, so it stays out of the citation-rate
        // denominator rather than counting as a zero.
        const annotations = (block?.annotations ?? []).filter(
            (a) => a.type === "url_citation" && a.url
        );

        return okSample({
            modelId,
            answerText: text,
            citations: annotations.length
                ? citationsPresent(annotations.map((a) => ({ url: a.url as string, title: a.title ?? null })))
                : citationsUnavailable(),
            latencyMs: elapsed(),
            costUnits: UNITS_PER_REQUEST,
        });
    }
}
