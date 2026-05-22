import { describe, expect, it } from "vitest";
import { runGrowthBlueprintAudit, summarizeBlueprintAudit } from "../../src/lib/growth/growth-blueprint-audit";

describe("growth blueprint audit", () => {
    it("runs without throwing and reports no blocking errors", () => {
        const items = runGrowthBlueprintAudit();
        const summary = summarizeBlueprintAudit(items);
        expect(summary.errors).toBe(0);
    });

    it("includes help nested route check", () => {
        const items = runGrowthBlueprintAudit();
        expect(items.find((i) => i.id === "help-nested-route")).toBeUndefined();
    });
});
