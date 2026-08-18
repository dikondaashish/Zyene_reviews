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
    phase: 1 | 2 | 3;
    /** Exact model the quoted cost covers; null for vendor-proxied surfaces. */
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
        /**
         * MEASURED $0.002/call live on 2026-08-07, correcting a $0.0006 estimate
         * that understated spend 3.3×. DEPTH-COUPLED: the rate is for
         * `organic/live/advanced` at the adapter's default depth 10, so raising
         * that depth invalidates this figure and the budget guard with it.
         */
        cost: { overageMicroUsd: 2_000, freePerDay: 0, confidence: "verified" },
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
        /**
         * MEASURED 2026-08-07 and NOT flat: $0.002 when Google returns no AI
         * Overview, $0.004 when it does — `load_async_ai_overview` bills only
         * when it yields one. The worst case is quoted deliberately, since a
         * guard that plans at the cheaper rate would authorise a day it cannot
         * afford on exactly the prompts that answer.
         */
        cost: { overageMicroUsd: 4_000, freePerDay: 0, confidence: "verified" },
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
        // DataForSEO reports the task cost on every response. The estimate is a
        // planning ceiling; settlement always uses the returned invoice amount.
        cost: { overageMicroUsd: 4_000, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: true,
    },
    chatgpt: {
        id: "chatgpt",
        label: "ChatGPT",
        surface: "answer_engine",
        vendor: "OpenAI",
        phase: 1,
        /** Responses API + hosted web_search. Pinned; the rate below is for this model. */
        pinnedModelId: "gpt-4o",
        /**
         * Dominant variable cost: ~60% of module spend at planned volumes.
         * ESTIMATE, and it stays one — OpenAI reports tokens, not money, so
         * there is no invoice to reconcile against. The adapter deliberately
         * does not synthesise one: the web_search fee is not itemised, so any
         * derived figure would undercount.
         */
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
        /**
         * Sonar: the cheapest search-grounded Perplexity model, and the one the
         * rate below was estimated from. Pinned for the same reason as Gemini —
         * an adapter that picked its own model would be priced against a rate
         * that does not cover it.
         */
        pinnedModelId: "sonar",
        /**
         * Token cost plus a per-request search fee; best signal per dollar.
         * MEASURED: 5 live sonar calls on 2026-08-07 averaged $0.005396 (range
         * $0.00530–$0.00553), replacing a $0.0067 estimate that ran ~24% high.
         * The ledger still prefers Perplexity's per-request reported cost; this
         * only drives planning and the budget projection the old value inflated.
         */
        cost: { overageMicroUsd: 5_400, freePerDay: 0, confidence: "verified" },
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
         * 2.5 Flash, not 2.5 Pro and not the app-wide 3.x default. Two binding
         * constraints: the written quote covers 2.0/2.5 only, and of those only
         * 2.5 Flash is callable here — 2.5 Pro and 2.5 Flash-Lite both 404
         * "no longer available to new users" despite being listed.
         * Full account and the revised ceiling: release plan §15.
         */
        pinnedModelId: "gemini-2.5-flash",
        /**
         * 2.0 Flash, 2.5 Flash and 2.5 Flash-Lite SHARE 1,500 free grounding
         * prompts/day account-wide, then $35 per 1,000. One grounding prompt may
         * fan out to several searches but bills once. Measured operational
         * ceiling is 545 businesses, not the 700 an even split suggests — §15.
         */
        cost: { overageMicroUsd: 35_000, freePerDay: 1_500, confidence: "verified" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    claude: {
        id: "claude",
        label: "Claude",
        surface: "answer_engine",
        vendor: "DataForSEO / Anthropic",
        phase: 2,
        pinnedModelId: "claude-haiku-4-5-20251001",
        // Conservative plan rate. DataForSEO returns task cost including the
        // Anthropic token/search charge, which is authoritative at settlement.
        cost: { overageMicroUsd: 25_000, freePerDay: 0, confidence: "estimated" },
        supportsCitations: true,
        supportsCoordinate: false,
    },
    copilot: {
        id: "copilot",
        label: "Copilot",
        surface: "answer_engine",
        vendor: "Microsoft Graph",
        phase: 3,
        pinnedModelId: "microsoft-365-copilot-chat-beta",
        // The API is included with a licensed delegated Microsoft 365 Copilot
        // user. Microsoft's documented ceiling is 200 requests/user/hour.
        cost: { overageMicroUsd: 0, freePerDay: 4_800, confidence: "verified" },
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
