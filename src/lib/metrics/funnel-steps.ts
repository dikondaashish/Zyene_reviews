/**
 * Turns stage counts (asked → delivered → clicked → …) into what a funnel
 * draws: bar width against the first stage, and how many moved on from the
 * stage above. Owners read the drop between steps, not five separate tiles.
 */
export type FunnelStepInput = { key: string; label: string; value: number };

export type FunnelStep = FunnelStepInput & {
    /** Share of the first stage, 0-100. */
    pctOfFirst: number;
    /** Share of the stage above; null for the first stage or when it can't be read as a drop. */
    pctOfPrev: number | null;
};

export function funnelSteps(stages: FunnelStepInput[]): FunnelStep[] {
    const first = stages[0]?.value ?? 0;
    return stages.map((stage, i) => {
        const value = Math.max(0, stage.value || 0);
        const prev = i > 0 ? Math.max(0, stages[i - 1].value || 0) : null;
        return {
            ...stage,
            value,
            pctOfFirst: first > 0 ? Math.min(100, (value / first) * 100) : 0,
            // A later stage larger than the one above (e.g. SMS clicks with no
            // email "opens") isn't a drop, so no arrow figure is shown.
            pctOfPrev: prev !== null && prev > 0 && value <= prev ? (value / prev) * 100 : null,
        };
    });
}

export function formatPct(pct: number): string {
    if (pct > 0 && pct < 1) return "<1%";
    return `${pct < 10 && pct % 1 !== 0 ? pct.toFixed(1) : Math.round(pct)}%`;
}

