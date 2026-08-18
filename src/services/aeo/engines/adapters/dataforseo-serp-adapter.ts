import { getEngineDescriptor } from "../engine-catalog";
import { engineError, failedSample } from "../engine-result";
import type {
    AnswerEngineAdapter,
    AnswerEngineId,
    EngineSampleRequest,
    EngineSampleResult,
} from "../engine-types";
import { resolveCountryName } from "../../locale/region-names";
import { reportedCost, usdToMicroUsd } from "./adapter-support";
import {
    callDataForSeo,
    classifyDataForSeoStatus,
    type DataForSeoItem,
} from "./dataforseo-client";
import { aiOverviewSample, serpSample } from "./dataforseo-sample";

/**
 * Google Search and Google AI Overview, via DataForSEO.
 *
 * These are SEARCH SURFACES, not answer engines, and the difference is
 * load-bearing. An answer engine returns prose; a SERP returns a ranked list.
 * To keep one contract over both, the ranked list is serialised into
 * `answerText` in a stable, documented order so the same deterministic brand
 * matcher can ask "does this business appear, and how early".
 *
 * That serialisation is evidence, not interpretation: it contains only what
 * DataForSEO returned, in the order it returned it. Nothing here decides
 * whether a brand is visible — that stays with E-6, as it does for every other
 * engine.
 *
 * Both surfaces bill from the first request (no free bucket), so the E-10 guard
 * does not gate them. DataForSEO reports actual cost per call, so the ledger
 * reconciles against an invoice rather than the catalog estimate.
 */

const DEFAULT_TIMEOUT_MS = 120_000;

export type DataForSeoAdapterOptions = {
    engineId?: Extract<AnswerEngineId, "google_serp" | "google_ai_overview">;
    login?: string;
    password?: string;
    timeoutMs?: number;
    /** Result depth. Lower is cheaper; 10 covers the local pack plus first page. */
    depth?: number;
};

export class DataForSeoSerpAdapter implements AnswerEngineAdapter {
    readonly id: Extract<AnswerEngineId, "google_serp" | "google_ai_overview">;
    /**
     * No model: this is a vendor-proxied search surface with nothing to pin.
     * The vendor is recorded instead, so a stored sample still says what
     * produced it — QA #1 requires a non-empty identifier on every sample.
     */
    readonly modelId = "dataforseo/google-serp";

    private readonly login: string | null;
    private readonly password: string | null;
    private readonly timeoutMs: number;
    private readonly depth: number;

    constructor(options: DataForSeoAdapterOptions = {}) {
        this.id = options.engineId ?? "google_serp";
        this.login = options.login?.trim() || process.env.DATAFORSEO_LOGIN?.trim() || null;
        this.password = options.password?.trim() || process.env.DATAFORSEO_PASSWORD?.trim() || null;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.depth = options.depth ?? 10;
        // Referenced so a catalog entry that loses its pricing is a startup
        // failure rather than a silent free-run.
        void getEngineDescriptor(this.id);
    }

    isConfigured(): boolean {
        return this.login !== null && this.password !== null;
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        const started = Date.now();
        const elapsed = () => Date.now() - started;

        if (!this.login || !this.password) {
            return failedSample({
                modelId: null,
                error: engineError("auth", "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD are not set"),
                latencyMs: elapsed(),
            });
        }

        // Refused before the request leaves, so an unplaceable search costs
        // nothing and is recorded as a refusal rather than as a null result.
        const location = locationFor(request);
        if (!location) {
            return failedSample({
                modelId: this.modelId,
                error: engineError(
                    "invalid_request",
                    `no DataForSEO location for country "${request.locale.country}"`
                ),
                latencyMs: elapsed(),
                costUnits: 0,
            });
        }

        const timeout = AbortSignal.timeout(this.timeoutMs);
        const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;

        const call = await callDataForSeo(
            "/serp/google/organic/live/advanced",
            {
                keyword: request.prompt,
                language_code: request.locale.language || "en",
                depth: this.depth,
                ...location,
                // Only requested for the AI Overview surface: it costs more and
                // there is no reason to pay for it on a plain SERP sample.
                ...(this.id === "google_ai_overview" ? { load_async_ai_overview: true } : {}),
            },
            { login: this.login, password: this.password },
            abort
        );

        const cost = reportedCost(usdToMicroUsd(call.costUsd));
        // One request = one unit, whatever the surface returned.
        const costUnits = call.httpStatus === 0 ? 0 : 1;

        if (!call.ok) {
            const code = call.taskStatusCode ?? call.statusCode;
            const { kind } = classifyDataForSeoStatus(code);
            return failedSample({
                modelId: this.modelId,
                error: engineError(
                    call.httpStatus === 0 ? "upstream_unavailable" : kind,
                    call.error ?? `${code}: ${call.taskStatusMessage ?? call.statusMessage ?? "unknown"}`
                ),
                latencyMs: elapsed(),
                // A request that never left is not billed; one DataForSEO
                // rejected may still be, and it tells us so on the envelope.
                costUnits,
                ...(call.httpStatus === 0 ? {} : cost),
            });
        }

        const items = call.result?.items ?? [];

        const shaped = { modelId: this.modelId, latencyMs: elapsed(), costUnits, cost };
        return this.id === "google_ai_overview"
            ? aiOverviewSample(items, shaped)
            : serpSample(items, shaped);
    }

}

/**
 * DataForSEO takes exactly one location field, and is strict about its shape.
 *
 * A coordinate wins when present — that is what the geo-grid (F1.12) supplies.
 *
 * `location_name` must be fully qualified — "Kansas City,Missouri,United States".
 * The bare city this used to send is rejected with 40501, so every Google sample
 * failed as `invalid_request` while still consuming a unit. An abbreviated state
 * ("Kansas City,MO,United States") is rejected identically.
 *
 * A city we cannot qualify falls back to the whole country rather than being
 * sent alone. That widens the measurement, which is visible in the result, where
 * silently resolving to the wrong Kansas City would not be.
 *
 * Returns null when it cannot place the search at all. The country fallback is
 * the US location code, so applying it to a country we cannot name would run an
 * Australian business's search in America and report the miss as absence — a
 * wrong answer dressed as a measurement. The caller refuses instead.
 */
function locationFor(request: EngineSampleRequest): Record<string, unknown> | null {
    const { locale } = request;
    if (locale.coordinate) {
        return { location_coordinate: `${locale.coordinate.lat},${locale.coordinate.lng}` };
    }
    const countryName = resolveCountryName(locale.country);
    if (!countryName) return null;
    if (locale.city && locale.region) {
        return { location_name: `${locale.city},${locale.region},${countryName}` };
    }
    return { location_code: 2840 }; // United States
}
