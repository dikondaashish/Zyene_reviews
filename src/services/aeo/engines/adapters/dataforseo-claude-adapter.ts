import { getEngineDescriptor } from "../engine-catalog";
import { citationsPresent, engineError, failedSample, noAnswerSample, okSample } from "../engine-result";
import type { AnswerEngineAdapter, EngineSampleRequest, EngineSampleResult } from "../engine-types";
import { reportedCost, usdToMicroUsd } from "./adapter-support";
import { classifyDataForSeoStatus, dataForSeoAuthHeader } from "./dataforseo-client";

const ENDPOINT = "https://api.dataforseo.com/v3/ai_optimization/claude/llm_responses/live";
const TIMEOUT_MS = 120_000;

type ClaudeSection = {
    type?: string;
    text?: string;
    annotations?: { title?: string; url?: string }[] | null;
};

type ClaudeEnvelope = {
    status_code?: number;
    status_message?: string;
    cost?: number;
    tasks?: {
        status_code?: number;
        status_message?: string;
        result?: { model_name?: string; items?: { type?: string; sections?: ClaudeSection[] }[] }[];
    }[];
};

export type DataForSeoClaudeOptions = { login?: string; password?: string; timeoutMs?: number };

/** Claude sampling with forced web search and vendor-reported task cost. */
export class DataForSeoClaudeAdapter implements AnswerEngineAdapter {
    readonly id = "claude" as const;
    readonly modelId: string;
    private readonly login: string | null;
    private readonly password: string | null;
    private readonly timeoutMs: number;

    constructor(options: DataForSeoClaudeOptions = {}) {
        const model = getEngineDescriptor("claude").pinnedModelId;
        if (!model) throw new Error("Claude catalog entry has no pinnedModelId");
        this.modelId = model;
        this.login = options.login?.trim() || process.env.DATAFORSEO_LOGIN?.trim() || null;
        this.password = options.password?.trim() || process.env.DATAFORSEO_PASSWORD?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
    }

    isConfigured(): boolean {
        return Boolean(this.login && this.password);
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        const started = Date.now();
        const elapsed = () => Date.now() - started;
        if (!this.login || !this.password) {
            return failedSample({ modelId: null, error: engineError("auth", "DataForSEO credentials are not set"), latencyMs: elapsed() });
        }

        const timeout = AbortSignal.timeout(this.timeoutMs);
        const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;
        let response: Response;
        try {
            response = await fetch(ENDPOINT, {
                method: "POST",
                headers: { Authorization: dataForSeoAuthHeader(this.login, this.password), "Content-Type": "application/json" },
                body: JSON.stringify([{
                    user_prompt: request.prompt.slice(0, 500),
                    system_message: "Always use web search before answering. Cite the sources you used.",
                    model_name: this.modelId,
                    max_output_tokens: 1200,
                    temperature: 0,
                    web_search: true,
                    ...localeFields(request),
                }]),
                signal: abort,
            });
        } catch (error) {
            const kind = error instanceof DOMException && error.name === "TimeoutError" ? "timeout" : "upstream_unavailable";
            return failedSample({ modelId: null, error: engineError(kind, error instanceof Error ? error.message : String(error)), latencyMs: elapsed() });
        }

        const envelope = await response.json().catch(() => null) as ClaudeEnvelope | null;
        const task = envelope?.tasks?.[0];
        const cost = reportedCost(usdToMicroUsd(envelope?.cost));
        if (!response.ok || envelope?.status_code !== 20000 || task?.status_code !== 20000) {
            const code = task?.status_code ?? envelope?.status_code;
            const kind = response.ok ? classifyDataForSeoStatus(code).kind : response.status === 429 ? "rate_limited" : "upstream_unavailable";
            return failedSample({ modelId: this.modelId, error: engineError(kind, task?.status_message ?? envelope?.status_message ?? `HTTP ${response.status}`), latencyMs: elapsed(), costUnits: 1, ...cost });
        }

        const result = task.result?.[0];
        const sections = (result?.items ?? []).filter((item) => item.type === "message").flatMap((item) => item.sections ?? []);
        const answerText = sections.map((part) => part.text?.trim()).filter(Boolean).join("");
        const sources = dedupeSources(sections.flatMap((part) => part.annotations ?? []));
        const modelId = result?.model_name?.trim() || this.modelId;
        if (!answerText) return noAnswerSample({ modelId, reason: "Claude returned no answer text", latencyMs: elapsed(), costUnits: 1, ...cost });
        return okSample({ modelId, answerText, citations: citationsPresent(sources), latencyMs: elapsed(), costUnits: 1, ...cost });
    }
}

function localeFields(request: EngineSampleRequest): Record<string, string> {
    const country = request.locale.country.toUpperCase();
    return country.length === 2 ? { web_search_country_iso_code: country } : {};
}

function dedupeSources(items: { title?: string; url?: string }[]): { title: string | null; url: string }[] {
    const seen = new Set<string>();
    return items.flatMap((item) => {
        const url = item.url?.trim();
        if (!url || seen.has(url)) return [];
        seen.add(url);
        return [{ url, title: item.title?.trim() || null }];
    });
}
