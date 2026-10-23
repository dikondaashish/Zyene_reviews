/**
 * Applied recommendations store their measured result as JSON
 * ({ visibilityDelta, citationDelta, successfulSamples }); the page used to print
 * that JSON as-is. This reads it into numbers an owner can see as up/down chips.
 */
export type ImpactView =
    | { kind: "pending" }
    | { kind: "measured"; visibilityPts: number | null; citationDelta: number; samples: number };

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function readRecommendationImpact(impact: unknown): ImpactView {
    if (!impact || typeof impact !== "object") return { kind: "pending" };
    const o = impact as Record<string, unknown>;
    const samples = num(o.successfulSamples);
    if (samples === null || samples === 0) return { kind: "pending" };
    const vis = num(o.visibilityDelta);
    return {
        kind: "measured",
        // Stored as a 0-1 fraction; owners read percentage points.
        visibilityPts: vis === null ? null : Math.round(vis * 100),
        citationDelta: num(o.citationDelta) ?? 0,
        samples,
    };
}
