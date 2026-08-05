import type { AnswerEngineId } from "./engine-types";

/**
 * Static metadata for every engine we intend to sample, including ones not yet
 * implemented. The catalog is deliberately complete so the coverage panel (F1.10)
 * can tell a user "Claude: Phase 2" rather than silently omitting it.
 *
 * `cost.confidence` is not decoration: the credit ledger (E-5) must refuse to meter
 * an engine whose price we have not confirmed, so an unverified vendor cannot
 * quietly start billing. See the release plan §6.
 */

export type EngineCostConfidence =
    /** Contracted or published rate, confirmed in writing for `pinnedModelId`. */
    | "verified"
    /** Published list price, not yet contracted. */
    | "estimated"
    /** No reliable figure. Must not be enabled for paid runs. */
    | "unverified";

export type EngineCost = {
    /**
     * Cost per sample once the free allowance is exhausted, in micro-USD
     * (millionths of a dollar) to keep integer math.
     */
    overageMicroUsd: number;
    /**
     * Samples per day at no charge, across the whole billing account — not per
     * business. Zero means every sample bills.
     *
     * This is a DAILY bucket, which makes run scheduling a cost lever: bursting
     * every account into one day forfeits the other six days of allowance. E-7
     * must smooth runs across the week.
     */
    freePerDay: number;
    confidence: EngineCostConfidence;
};

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
         * Pinned to 2.5 Pro on purpose, even though the rest of the app runs
         * Gemini 3.x (see vertex-adapter.ts). Two reasons:
         *
         * 1. The written grounding quote covers 2.0/2.5 only. Calling a 3.x model
         *    would price us against a rate that does not cover it.
         * 2. Grounding fees dominate token fees in this workload. Pro's 10,000/day
         *    free bucket is 6.7x Flash's 1,500/day, which more than offsets Pro's
         *    higher token rate anywhere between ~420 and ~2,800 tracked businesses.
         *
         * Revisit if a Gemini 3 grounding rate is confirmed.
         */
        pinnedModelId: "gemini-2.5-pro",
        // Confirmed: 10,000 grounding prompts/day free, then $35 per 1,000.
        // One grounding prompt may fan out to several search queries, billed once.
        cost: { overageMicroUsd: 35_000, freePerDay: 10_000, confidence: "verified" },
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
    return CATALOG[id].cost.confidence !== "unverified";
}

/**
 * Cost of a day's sampling for one engine, honouring its free allowance.
 *
 * Takes account-wide samples per day, not per-business: free buckets are shared,
 * so per-business apportionment must be done by the caller after this returns.
 */
export function estimateDailyCostMicroUsd(id: AnswerEngineId, samplesPerDay: number): number {
    const { freePerDay, overageMicroUsd } = CATALOG[id].cost;
    const billable = Math.max(0, Math.floor(samplesPerDay) - freePerDay);
    return billable * overageMicroUsd;
}
