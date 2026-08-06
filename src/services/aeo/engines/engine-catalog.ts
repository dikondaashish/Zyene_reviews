import type { AnswerEngineId } from "./engine-types";
import type { EngineCost } from "./engine-cost";
import { dailyCostMicroUsd, isCostMeterable } from "./engine-cost";

/**
 * Static metadata for every engine we intend to sample, including ones not yet
 * implemented. The catalog is deliberately complete so the coverage panel (F1.10)
 * can tell a user "Claude: Phase 2" rather than silently omitting it.
 *
 * The cost model itself lives in engine-cost.ts; `cost.confidence` is not
 * decoration, and resolveRunnable refuses to meter an engine whose price we have
 * not confirmed. See the release plan §6.
 */

export type { EngineCost, EngineCostConfidence } from "./engine-cost";

export type AnswerEngineDescriptor = {
    id: AnswerEngineId;
    label: string;
    /** Answer engines produce prose; search surfaces produce ranked results. */
    surface: "answer_engine" | "search";
    vendor: string;
    /** Rollout phase from the release plan roadmap. */
    phase: 1 | 2 | 3;
    /**
     * The exact model `cost` was quoted for. Adapters must call this model and no
     * other — inheriting an app-wide default would price us against a rate that
     * does not cover it. Null for vendor-proxied surfaces with no model choice.
     */
    pinnedModelId: string | null;
    cost: EngineCost;
    /** Whether the engine exposes source URLs at all (drives EngineCitations). */
    supportsCitations: boolean;
    /** Whether the engine accepts a lat/lng, required for the geo-grid (PRD-5). */
    supportsCoordinate: boolean;
};

const CATALOG: Readonly<Record<AnswerEngineId, AnswerEngineDescriptor>> = {
    google_serp: {
        id: "google_serp",
        label: "Google Search",
        surface: "search",
        vendor: "DataForSEO",
        phase: 1,
        pinnedModelId: null,
        cost: { overageMicroUsd: 600, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: true,
    },
    google_ai_overview: {
        id: "google_ai_overview",
        label: "Google AI Overview",
        surface: "answer_engine",
        vendor: "DataForSEO",
        phase: 1,
        pinnedModelId: null,
        cost: { overageMicroUsd: 600, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: true,
    },
    google_ai_mode: {
        id: "google_ai_mode",
        label: "Google AI Mode",
        surface: "answer_engine",
        vendor: "DataForSEO",
        phase: 2,
        pinnedModelId: null,
        cost: { overageMicroUsd: 1_200, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: true,
    },
    chatgpt: {
        id: "chatgpt",
        label: "ChatGPT",
        surface: "answer_engine",
        vendor: "OpenAI",
        phase: 1,
        pinnedModelId: null,
        // Dominant variable cost: ~60% of module spend at planned volumes.
        cost: { overageMicroUsd: 25_000, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    perplexity: {
        id: "perplexity",
        label: "Perplexity",
        surface: "answer_engine",
        vendor: "Perplexity",
        phase: 1,
        pinnedModelId: null,
        // Token cost plus a per-request search fee; best signal per dollar.
        cost: { overageMicroUsd: 6_700, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    gemini: {
        id: "gemini",
        label: "Gemini",
        surface: "answer_engine",
        vendor: "Google Vertex",
        phase: 1,
        /**
         * Pinned to 2.5 Flash, even though the rest of the app runs Gemini 3.x
         * (see vertex-adapter.ts). Two separate constraints force this exact model:
         *
         * 1. The written grounding quote covers the 2.0/2.5 generation only.
         *    Calling a 3.x model would price us against a rate that does not
         *    cover it — the mismatch this pinning exists to prevent.
         * 2. Of the models that quote covers, 2.5 Flash is the only one this
         *    project can actually call. Verified 2026-08-06 against the live key:
         *    both `gemini-2.5-pro` and `gemini-2.5-flash-lite` return
         *    404 "no longer available to new users"; 2.5 Flash returns real
         *    groundingMetadata with resolvable citation URIs.
         *
         * This was originally pinned to 2.5 Pro for its 10,000/day free bucket.
         * That bucket is unreachable on a new project, so the planning figure it
         * justified (~4,667 businesses before the first dollar) does not hold —
         * see the freePerDay note below. Revisit if Pro access is granted, or if
         * a Gemini 3 grounding rate is ever confirmed in writing.
         */
        pinnedModelId: "gemini-2.5-flash",
        /**
         * Confirmed: 2.0 Flash, 2.5 Flash and 2.5 Flash-Lite SHARE 1,500 free
         * grounding prompts/day across the billing account, then $35 per 1,000.
         * One grounding prompt may fan out to several search queries, billed once.
         *
         * Shared, so this number is a ceiling for all of them together, not for
         * 2.5 Flash alone. At the modelled 15 prompts/week cadence that is
         * 1,500 x 7 / 15 = 700 businesses before the first dollar — down from the
         * 4,667 that 2.5 Pro's bucket would have allowed.
         */
        cost: { overageMicroUsd: 35_000, freePerDay: 1_500, confidence: "verified" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    claude: {
        id: "claude",
        label: "Claude",
        surface: "answer_engine",
        vendor: "Anthropic",
        phase: 2,
        pinnedModelId: null,
        cost: { overageMicroUsd: 12_000, freePerDay: 0, confidence: "unverified" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    copilot: {
        id: "copilot",
        label: "Copilot",
        surface: "answer_engine",
        vendor: "TBD",
        phase: 3,
        pinnedModelId: null,
        cost: { overageMicroUsd: 0, freePerDay: 0, confidence: "unverified" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
} as const;

export function getEngineDescriptor(id: AnswerEngineId): AnswerEngineDescriptor {
    return CATALOG[id];
}

export function listEngineDescriptors(): AnswerEngineDescriptor[] {
    return Object.values(CATALOG);
}

/**
 * Whether an engine may be used in a run that spends money. Unverified pricing is
 * a hard block: we will not bill a customer for a vendor whose rate we cannot state.
 */
export function isMeterable(id: AnswerEngineId): boolean {
    return isCostMeterable(CATALOG[id].cost);
}

/**
 * Cost of a day's sampling for one engine, honouring its free allowance.
 *
 * Takes account-wide samples per day, not per-business: free buckets are shared,
 * so per-business apportionment must be done by the caller after this returns.
 */
export function estimateDailyCostMicroUsd(id: AnswerEngineId, samplesPerDay: number): number {
    return dailyCostMicroUsd(CATALOG[id].cost, samplesPerDay);
}
