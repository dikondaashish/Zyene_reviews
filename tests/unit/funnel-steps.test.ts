import { describe, expect, it } from "vitest";
import { formatPct, funnelSteps } from "@/lib/metrics/funnel-steps";

describe("funnelSteps", () => {
    it("gives each step its share of the first and of the step above", () => {
        const steps = funnelSteps([
            { key: "sent", label: "Sent", value: 300 },
            { key: "delivered", label: "Delivered", value: 276 },
            { key: "clicked", label: "Clicked", value: 69 },
            { key: "done", label: "Finished", value: 41 },
        ]);
        expect(steps.map((s) => Math.round(s.pctOfFirst))).toEqual([100, 92, 23, 14]);
        expect(steps[0].pctOfPrev).toBeNull();
        expect(Math.round(steps[1].pctOfPrev ?? 0)).toBe(92);
        expect(Math.round(steps[2].pctOfPrev ?? 0)).toBe(25);
    });

    it("shows no drop when a later step is bigger or the one above is empty", () => {
        const steps = funnelSteps([
            { key: "a", label: "Asked", value: 0 },
            { key: "o", label: "Opened", value: 0 },
            { key: "c", label: "Clicked", value: 5 },
        ]);
        expect(steps.map((s) => s.pctOfFirst)).toEqual([0, 0, 0]);
        expect(steps.map((s) => s.pctOfPrev)).toEqual([null, null, null]);
    });

    it("formats small and fractional shares", () => {
        expect(formatPct(0.4)).toBe("<1%");
        expect(formatPct(4.25)).toBe("4.3%");
        expect(formatPct(23.4)).toBe("23%");
        expect(formatPct(0)).toBe("0%");
    });
});
