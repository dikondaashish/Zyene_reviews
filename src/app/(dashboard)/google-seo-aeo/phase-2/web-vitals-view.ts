/**
 * Google's Core Web Vitals thresholds (web.dev/vitals): each metric is
 * good, needs improvement, or poor. Owners read a traffic light, not "LCP 3100 ms".
 */
export type VitalKey = "lcp" | "cls" | "inp";
export type VitalRating = "good" | "needs-work" | "poor" | "unknown";

const THRESHOLDS: Record<VitalKey, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 },
};

export const VITAL_LABEL: Record<VitalKey, string> = {
    lcp: "Loading speed",
    cls: "Page stays still",
    inp: "Reacts to taps",
};

export function rateVital(key: VitalKey, value: number | null): VitalRating {
    if (value === null || !Number.isFinite(value)) return "unknown";
    const t = THRESHOLDS[key];
    return value <= t.good ? "good" : value <= t.poor ? "needs-work" : "poor";
}

export function formatVital(key: VitalKey, value: number | null): string {
    if (value === null) return "not measured";
    if (key === "cls") return value.toFixed(2);
    return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`;
}
