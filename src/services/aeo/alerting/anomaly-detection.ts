type Point = { date: string; value: number };

function median(values: readonly number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2
        ? sorted[middle] ?? 0
        : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function detectMetricAnomaly(history: readonly Point[], current: Point, threshold = 3.5) {
    const distinctDays = new Set(history.map((row) => row.date)).size;
    if (distinctDays < 90) return { eligible: false as const, reason: "insufficient_history" as const, historyDays: distinctDays };
    const baseline = median(history.map((row) => row.value));
    const mad = median(history.map((row) => Math.abs(row.value - baseline)));
    const robustZ = mad === 0 ? (current.value === baseline ? 0 : Number.POSITIVE_INFINITY) : 0.6745 * (current.value - baseline) / mad;
    return {
        eligible: true as const,
        anomalous: Math.abs(robustZ) >= threshold,
        direction: current.value >= baseline ? "up" as const : "down" as const,
        baseline,
        mad,
        robustZ,
        historyDays: distinctDays,
    };
}
