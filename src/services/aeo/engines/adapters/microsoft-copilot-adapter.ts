import { buildLocalePrompt, classifyHttpStatus } from "./adapter-support";
import { citationsPresent, engineError, failedSample, noAnswerSample, okSample } from "../engine-result";
import type { AnswerEngineAdapter, EngineSampleRequest, EngineSampleResult } from "../engine-types";

const GRAPH = "https://graph.microsoft.com/beta/copilot/conversations";
const MODEL_ID = "microsoft-365-copilot-chat-beta";

type CopilotMessage = {
    text?: string;
    attributions?: { attributionType?: string; providerDisplayName?: string; seeMoreWebUrl?: string }[];
};

type Options = { accessToken?: string; timeoutMs?: number; enabled?: boolean };

export class MicrosoftCopilotAdapter implements AnswerEngineAdapter {
    readonly id = "copilot" as const;
    readonly modelId = MODEL_ID;
    private readonly token: string | null;
    private readonly timeoutMs: number;
    private readonly enabled: boolean;

    constructor(options: Options = {}) {
        this.token = options.accessToken?.trim() || process.env.MICROSOFT_COPILOT_ACCESS_TOKEN?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? 90_000;
        this.enabled = options.enabled ?? (Boolean(options.accessToken) || process.env.AEO_ENABLE_COPILOT_PREVIEW === "true");
    }

    isConfigured(): boolean {
        return this.enabled && this.token !== null;
    }

    private async request(path: string, body: unknown, signal: AbortSignal): Promise<Response> {
        return fetch(`${GRAPH}${path}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal,
        });
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        const started = Date.now();
        const elapsed = () => Date.now() - started;
        if (!this.isConfigured()) return failedSample({ modelId: null, error: engineError("auth", "Microsoft Copilot delegated access is not configured"), latencyMs: elapsed() });
        const timeout = AbortSignal.timeout(this.timeoutMs);
        const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;
        try {
            const created = await this.request("", {}, abort);
            if (!created.ok) return this.failed(created, elapsed());
            const conversation = await created.json() as { id?: string };
            if (!conversation.id) return failedSample({ modelId: MODEL_ID, error: engineError("upstream_unavailable", "Copilot returned no conversation id"), latencyMs: elapsed() });
            const response = await this.request(`/${encodeURIComponent(conversation.id)}/chat`, {
                message: { text: buildLocalePrompt(request) },
                locationHint: { timeZone: "UTC" },
                contextualResources: { webContext: { isWebEnabled: true } },
            }, abort);
            if (!response.ok) return this.failed(response, elapsed());
            const payload = await response.json() as { messages?: CopilotMessage[] };
            const message = [...(payload.messages ?? [])].reverse().find((item) => item.text?.trim());
            const answerText = message?.text?.trim() ?? "";
            if (!answerText) return noAnswerSample({ modelId: MODEL_ID, reason: "Copilot returned no answer", latencyMs: elapsed(), costUnits: 1, reportedCostMicroUsd: 0 });
            const sources = (message?.attributions ?? []).flatMap((item) =>
                item.attributionType === "citation" && item.seeMoreWebUrl
                    ? [{ url: item.seeMoreWebUrl, title: item.providerDisplayName ?? null }]
                    : []
            );
            return okSample({ modelId: MODEL_ID, answerText, citations: citationsPresent(sources), latencyMs: elapsed(), costUnits: 1, reportedCostMicroUsd: 0 });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return failedSample({ modelId: MODEL_ID, error: engineError(/abort|timeout/i.test(message) ? "timeout" : "upstream_unavailable", message), latencyMs: elapsed() });
        }
    }

    private async failed(response: Response, latencyMs: number): Promise<EngineSampleResult> {
        const body = await response.text().catch(() => "");
        return failedSample({ modelId: MODEL_ID, error: engineError(classifyHttpStatus(response.status, body), `HTTP ${response.status}: ${body.slice(0, 300)}`), latencyMs });
    }
}
