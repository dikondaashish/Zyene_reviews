import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import {
    loadVisibilityFacts,
    VISIBILITY_WINDOW_DAYS,
} from "@/services/aeo/reporting/load-visibility-facts";
import {
    computeEngineVisibility,
    computeOverallVisibility,
} from "@/services/aeo/reporting/visibility-metrics";
import {
    formatRate,
    suppressionMessage,
    toVisibilityTiles,
} from "./aeo-visibility-view-model";
import type { AeoVisibilityContent } from "./aeo-visibility-section";

/**
 * Null when this business has never been sampled.
 *
 * Distinguished from "sampled and found nothing" by the caller: a business with
 * no runs yet gets an onboarding prompt, not a 0% score it never earned.
 */
export async function loadAeoVisibility(
    db: SupabaseClient<Database>,
    businessId: string
): Promise<AeoVisibilityContent | null> {
    const { facts } = await loadVisibilityFacts(db, businessId);
    if (facts.length === 0) return null;

    const engines = computeEngineVisibility(facts);
    const overall = computeOverallVisibility(facts);

    const answeredEngines = engines.filter((e) => e.observations > 0).length;
    const retained = engines.reduce((n, e) => n + e.provenance.withStoredAnswer, 0);
    // One estimated sample anywhere makes the pooled figure estimated too —
    // QA #36 is about the number shown, not about its best-sourced component.
    const overallBasis = engines.every((e) => e.provenance.basis === "measured")
        ? ("measured" as const)
        : ("estimated" as const);

    return {
        tiles: toVisibilityTiles(engines, VISIBILITY_WINDOW_DAYS),
        overallRate: overall.visibilityRate === null ? null : formatRate(overall.visibilityRate),
        overallSuppressedMessage: overall.suppressed ? suppressionMessage(overall.suppressed) : null,
        overallDetail: `Named in ${overall.namedCount} of ${overall.observations} answers across ${answeredEngines} engine${answeredEngines === 1 ? "" : "s"}`,
        overallBasis,
        overallProvenance: [
            { label: "Engines sampled", value: String(engines.length) },
            { label: "Engines that answered", value: String(answeredEngines) },
            { label: "Window", value: `Last ${VISIBILITY_WINDOW_DAYS} days` },
            { label: "Samples", value: String(facts.length) },
            { label: "Answers read", value: String(overall.observations) },
            { label: "Named the brand", value: `${overall.namedCount} of ${overall.observations}` },
            {
                label: "Answer retained",
                value: `${retained} of ${overall.observations}${retained < overall.observations ? " (older samples not kept)" : ""}`,
            },
            { label: "Basis", value: overallBasis === "measured" ? "Measured" : "Estimated" },
        ],
        windowDays: VISIBILITY_WINDOW_DAYS,
    };
}
