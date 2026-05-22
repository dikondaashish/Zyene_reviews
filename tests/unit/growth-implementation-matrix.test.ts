import { describe, expect, it } from "vitest";
import {
    GROWTH_IMPLEMENTATION_MATRIX,
    summarizeImplementationMatrix,
} from "../../src/lib/growth/implementation-matrix";

describe("growth implementation matrix", () => {
    it("covers phases 0 through 8", () => {
        const phases = GROWTH_IMPLEMENTATION_MATRIX.map((p) => p.phase);
        expect(phases).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("marks engineering phases complete", () => {
        for (const phase of GROWTH_IMPLEMENTATION_MATRIX) {
            expect(phase.status).toBe("complete");
        }
    });

    it("includes KPI dashboard deliverable in phase 8", () => {
        const p8 = GROWTH_IMPLEMENTATION_MATRIX.find((p) => p.phase === 8)!;
        const allTasks = p8.blocks.flatMap((b) => b.tasks);
        expect(allTasks.some((t) => t.id === "p8-kpi")).toBe(true);
    });

    it("summarizes task counts", () => {
        const s = summarizeImplementationMatrix(GROWTH_IMPLEMENTATION_MATRIX);
        expect(s.total).toBeGreaterThan(40);
        expect(s.complete).toBeGreaterThan(s.external);
    });
});
