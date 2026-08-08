import { getEngineDescriptor } from "@/services/aeo/engines/engine-catalog";
import type {
    EngineVisibility,
    Suppression,
} from "@/services/aeo/reporting/visibility-metrics";
import type { ProvenanceRow } from "@/components/google-seo-aeo/metric-provenance";

export type VisibilityTile = {
    engineId: string;
    label: string;
    /** Pre-formatted percentage, or null when the rate is withheld. */
    rate: string | null;
    /** Present only when `rate` is null. Explains the withholding (QA #37). */
    suppressedMessage: string | null;
    detail: string;
    basis: "measured" | "estimated";
    provenance: ProvenanceRow[];
};

/** Fixed locale, so the server and the client agree on the string. */
function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }) + " UTC";
}

export function formatRate(rate: number): string {
    return `${(rate * 100).toFixed(rate > 0 && rate < 0.01 ? 1 : 0)}%`;
}

/**
 * Says what is missing and how much more is needed, rather than "not enough
 * data" — a reader who cannot tell whether the gap is one sample or a hundred
 * has no way to judge whether the number is coming.
 */
export function suppressionMessage(s: Suppression): string {
    const short = s.required - s.observations;
    return s.observations === 0
        ? `No answers yet — needs ${s.required} to report a rate.`
        : `Only ${s.observations} answer${s.observations === 1 ? "" : "s"} so far — ${short} more needed before this can be reported.`;
}

function provenanceRows(v: EngineVisibility, windowLabel: string): ProvenanceRow[] {
    const p = v.provenance;
    return [
        { label: "Engine", value: getEngineDescriptor(v.engineId).label },
        { label: "Model", value: p.modelIds.length > 0 ? p.modelIds.join(", ") : "not reported" },
        { label: "Basis", value: p.basis === "measured" ? "Measured" : "Estimated" },
        { label: "Window", value: windowLabel },
        { label: "Samples", value: `${p.totalSamples} (${p.observations} answered)` },
        // Named separately from "answered": a refusal is not a negative answer,
        // and lumping them would silently pad the denominator.
        { label: "Named the brand", value: `${v.namedCount} of ${p.observations}` },
        { label: "No answer", value: String(v.noAnswer) },
        { label: "Failed", value: String(v.failed) },
        {
            label: "Answer retained",
            value:
                p.observations === 0
                    ? "—"
                    : `${p.withStoredAnswer} of ${p.observations}${p.withStoredAnswer < p.observations ? " (older samples not kept)" : ""}`,
        },
        { label: "First sampled", value: formatDate(p.firstSampledAt) },
        { label: "Last sampled", value: formatDate(p.lastSampledAt) },
    ];
}

export function toVisibilityTiles(
    engines: readonly EngineVisibility[],
    windowDays: number
): VisibilityTile[] {
    const windowLabel = `Last ${windowDays} days`;

    return engines.map((v) => ({
        engineId: v.engineId,
        label: getEngineDescriptor(v.engineId).label,
        rate: v.visibilityRate === null ? null : formatRate(v.visibilityRate),
        suppressedMessage: v.suppressed ? suppressionMessage(v.suppressed) : null,
        detail:
            v.observations === 0
                ? `${v.failed + v.noAnswer} attempt${v.failed + v.noAnswer === 1 ? "" : "s"}, no answer read`
                : `Named in ${v.namedCount} of ${v.observations} answer${v.observations === 1 ? "" : "s"}`,
        basis: v.provenance.basis,
        provenance: provenanceRows(v, windowLabel),
    }));
}
