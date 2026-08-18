import { engineRegistry } from "./engine-registry";
import { GeminiEngineAdapter } from "./adapters/gemini-engine-adapter";
import { PerplexityEngineAdapter } from "./adapters/perplexity-engine-adapter";
import { ChatGptEngineAdapter } from "./adapters/chatgpt-engine-adapter";
import { DataForSeoSerpAdapter } from "./adapters/dataforseo-serp-adapter";
import { DataForSeoClaudeAdapter } from "./adapters/dataforseo-claude-adapter";

/**
 * Registers the real, billable adapters.
 *
 * Deliberately explicit rather than a side effect of importing an adapter
 * module. An adapter that self-registered would become reachable from any file
 * that happened to import it, including tests — and "reachable" here means "can
 * spend money". Registration is one call, in one place, so the set of engines
 * that can bill is greppable.
 *
 * This does NOT decide whether sampling runs. Three independent gates stand in
 * front of a vendor call, and all must pass:
 *
 *   1. AEO_LIVE_SAMPLING === "true"      — checked in the Inngest functions
 *   2. adapter.isConfigured()            — its own API key is present
 *   3. cost.confidence !== "unverified"  — resolveRunnable withholds unpriced engines
 *
 * Registering an engine satisfies none of them on its own.
 */

let registered = false;

export function registerAeoAdapters(): void {
    if (registered) return;
    registered = true;

    // Unconfigured adapters are still registered on purpose: the registry then
    // reports `not_configured` with a reason, which the coverage panel (F1.10)
    // shows to the user. Omitting them would make a missing key look like an
    // engine we never intended to support.
    engineRegistry.register(new GeminiEngineAdapter());
    engineRegistry.register(new PerplexityEngineAdapter());
    // Most expensive engine per sample; deliberately not in DEFAULT_ENGINES, so
    // a run has to ask for it by name.
    engineRegistry.register(new ChatGptEngineAdapter());

    // Google surfaces via DataForSEO. Two registrations, one adapter class:
    // same transport, different surface, and they must stay separately
    // meterable because AI Overview costs more than a plain SERP.
    engineRegistry.register(new DataForSeoSerpAdapter({ engineId: "google_serp" }));
    engineRegistry.register(new DataForSeoSerpAdapter({ engineId: "google_ai_overview" }));
    engineRegistry.register(new DataForSeoSerpAdapter({ engineId: "google_ai_mode" }));
    engineRegistry.register(new DataForSeoClaudeAdapter());
}

/** Test seam — lets a suite start from a known-empty registry. */
export function resetAeoAdapterRegistration(): void {
    registered = false;
}
