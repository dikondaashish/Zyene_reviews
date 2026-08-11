import { getEngineDescriptor } from "../engine-catalog";
import {
    citationsPresent,
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
import {
    buildLocalePrompt,
    classifyHttpStatus,
    reportedCost,
    retryAfterMs,
    usdToMicroUsd,
} from "./adapter-support";

/**
 * Perplexity Sonar.
 *
 * Uses /chat/completions, NOT the /search endpoint. Search returns ranked links;
 * this module measures what an answer engine SAYS about a business, and a link
 * list is a different product that would quietly turn AEO back into rank
 * tracking.
 *
 * Perplexity is the only engine wired so far that reports its own per-request
 * cost, so samples carry the invoice rather than a catalog estimate. On a real
 * call the two differed by 26% ($0.00532 actual against a $0.0067 estimate),
 * which would compound silently across a month of sampling.
 *
 * Bills from the first request — there is no free bucket to protect, so the
 * E-10 budget guard deliberately does not stand in the way. Affordability here
 * is the ledger's job.
 */

/** One request = one unit. Perplexity prices per request, not per credit. */
const UNITS_PER_REQUEST = 1;

const DEFAULT_TIMEOUT_MS = 60_000;
const API_URL = "https://api.perplexity.ai/chat/completions";

type PerplexityResponse = {
    model?: string;
    choices?: { message?: { content?: string }; finish_reason?: string }[];
    citations?: string[];
    search_results?: { title?: string; url?: string }[];
    usage?: { cost?: { total_cost?: number } };
};

export type PerplexityEngineAdapterOptions = {
    apiKey?: string;
    timeoutMs?: number;
};

export class PerplexityEngineAdapter implements AnswerEngineAdapter {
    readonly id = "perplexity" as const;
    readonly modelId: string;

    private readonly apiKey: string | null;
    private readonly timeoutMs: number;

    constructor(options: PerplexityEngineAdapterOptions = {}) {
        const pinned = getEngineDescriptor("perplexity").pinnedModelId;
        if (!pinned) throw new Error("Perplexity catalog entry has no pinnedModelId");
        this.modelId = pinned;
        this.apiKey = options.apiKey?.trim() || process.env.PERPLEXITY_API_KEY?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
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
                error: engineError("auth", "PERPLEXITY_API_KEY is not set"),
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
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: [{ role: "user", content: buildLocalePrompt(request) }],
                }),
                signal: abort,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return failedSample({
                modelId: this.modelId,
                error: engineError(/abort|timed? ?out/i.test(message) ? "timeout" : "upstream_unavailable", message),
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
                // A rejected request is not billed. Under-recording is
                // correctable from the invoice; a phantom charge is not.
                costUnits: 0,
            });
        }

        let body: PerplexityResponse;
        try {
            body = (await response.json()) as PerplexityResponse;
        } catch {
            return failedSample({
                modelId: this.modelId,
                error: engineError("upstream_unavailable", "response was not valid JSON"),
                latencyMs: elapsed(),
            });
        }

        const text = body.choices?.[0]?.message?.content?.trim() ?? "";
        // The request completed and is billable whatever it returned.
        const reportedCostMicroUsd = usdToMicroUsd(body.usage?.cost?.total_cost);
        // The model that actually answered, when reported — it can differ from
        // what we asked for, and a trend line needs to know that.
        const modelId = body.model?.trim() || this.modelId;

        if (!text) {
            return noAnswerSample({
                modelId,
                reason: body.choices?.[0]?.finish_reason
                    ? `empty response (finish_reason: ${body.choices[0].finish_reason})`
                    : "empty response",
                latencyMs: elapsed(),
                costUnits: UNITS_PER_REQUEST,
                ...reportedCost(reportedCostMicroUsd),
            });
        }

        return okSample({
            modelId,
            answerText: text,
            // Always `present`: Sonar is a search-grounded engine, so zero
            // sources is a real zero and belongs in the denominator. This is
            // never `unavailable` — that state is for engines with no notion of
            // sources at all.
            citations: citationsPresent(mergeCitations(body)),
            latencyMs: elapsed(),
            costUnits: UNITS_PER_REQUEST,
            ...reportedCost(reportedCostMicroUsd),
        });
    }
}

/**
 * `search_results` carries titles; `citations` is a bare URL list. They cover
 * the same sources, so titles are joined on by URL and the citation list keeps
 * its ordering — that order is the prominence signal (F3.4).
 */
function mergeCitations(body: PerplexityResponse): { url: string; title: string | null }[] {
    const titleByUrl = new Map<string, string>();
    for (const result of body.search_results ?? []) {
        if (result.url && result.title) titleByUrl.set(result.url, result.title);
    }

    const urls = body.citations?.length
        ? body.citations
        : (body.search_results ?? []).map((r) => r.url ?? "");

    return urls
        .filter((url): url is string => Boolean(url))
        .map((url) => ({ url, title: titleByUrl.get(url) ?? null }));
}
