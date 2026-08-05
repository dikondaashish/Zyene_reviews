import type { AnswerEngineId } from "./engine-types";

/**
 * Static metadata for every engine we intend to sample, including ones not yet
 * implemented. The catalog is deliberately complete so the coverage panel (F1.10)
 * can tell a user "Claude: Phase 2" rather than silently omitting it.
 *
 * Costs are per sample, in micro-USD (millionths of a dollar) to keep integer math.
 * `costConfidence` is not decoration: the credit ledger (E-5) must refuse to meter
 * an engine whose price we have not confirmed, so an unverified vendor cannot
 * quietly start billing. See the release plan §6.2.
 */

export type EngineCostConfidence =
    /** Contracted rate, confirmed in writing. */
    | "verified"
    /** Published list price, not yet contracted. */
    | "estimated"
    /** No reliable figure. Must not be enabled for paid runs. */
    | "unverified";

export type AnswerEngineDescriptor = {
    id: AnswerEngineId;
    label: string;
    /** Answer engines produce prose; search surfaces produce ranked results. */
    surface: "answer_engine" | "search";
    vendor: string;
    /** Rollout phase from the release plan roadmap. */
    phase: 1 | 2 | 3;
    estimatedCostMicroUsd: number;
    costConfidence: EngineCostConfidence;
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
        estimatedCostMicroUsd: 600,
        costConfidence: "estimated",
        supportsCitations: true,
        supportsCoordinate: true,
    },
    google_ai_overview: {
        id: "google_ai_overview",
        label: "Google AI Overview",
        surface: "answer_engine",
        vendor: "DataForSEO",
        phase: 1,
        estimatedCostMicroUsd: 600,
        costConfidence: "estimated",
        supportsCitations: true,
        supportsCoordinate: true,
    },
    google_ai_mode: {
        id: "google_ai_mode",
        label: "Google AI Mode",
        surface: "answer_engine",
        vendor: "DataForSEO",
        phase: 2,
        estimatedCostMicroUsd: 1200,
        costConfidence: "estimated",
        supportsCitations: true,
        supportsCoordinate: true,
    },
    chatgpt: {
        id: "chatgpt",
        label: "ChatGPT",
        surface: "answer_engine",
        vendor: "OpenAI",
        phase: 1,
        // Dominant variable cost: ~60% of module spend at planned volumes.
        estimatedCostMicroUsd: 25_000,
        costConfidence: "estimated",
        supportsCitations: true,
        supportsCoordinate: false,
    },
    perplexity: {
        id: "perplexity",
        label: "Perplexity",
        surface: "answer_engine",
        vendor: "Perplexity",
        phase: 1,
        // Token cost plus a per-request search fee; best signal per dollar.
        estimatedCostMicroUsd: 6_700,
        costConfidence: "estimated",
        supportsCitations: true,
        supportsCoordinate: false,
    },
    gemini: {
        id: "gemini",
        label: "Gemini",
        surface: "answer_engine",
        vendor: "Google Vertex",
        phase: 1,
        // Grounded-request fees are NOT confirmed. This figure swings total module
        // COGS by ~70%. Blocked from paid runs until a written quote lands (Q3).
        estimatedCostMicroUsd: 5_000,
        costConfidence: "unverified",
        supportsCitations: true,
        supportsCoordinate: false,
    },
    claude: {
        id: "claude",
        label: "Claude",
        surface: "answer_engine",
        vendor: "Anthropic",
        phase: 2,
        estimatedCostMicroUsd: 12_000,
        costConfidence: "unverified",
        supportsCitations: true,
        supportsCoordinate: false,
    },
    copilot: {
        id: "copilot",
        label: "Copilot",
        surface: "answer_engine",
        vendor: "TBD",
        phase: 3,
        estimatedCostMicroUsd: 0,
        costConfidence: "unverified",
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
    return CATALOG[id].costConfidence !== "unverified";
}
