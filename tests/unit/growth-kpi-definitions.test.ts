import { describe, expect, it } from "vitest";
import { KPI_DEFINITIONS, KPI_BY_ID } from "../../src/lib/growth/kpi-definitions";

describe("growth KPI definitions", () => {
    it("covers all blueprint categories", () => {
        const categories = new Set(KPI_DEFINITIONS.map((k) => k.category));
        expect(categories.has("acquisition")).toBe(true);
        expect(categories.has("conversion")).toBe(true);
        expect(categories.has("retention")).toBe(true);
        expect(categories.has("plg")).toBe(true);
    });

    it("has 15 metrics matching blueprint tables", () => {
        expect(KPI_DEFINITIONS.length).toBe(15);
    });

    it("maps every id for snapshot merge", () => {
        for (const k of KPI_DEFINITIONS) {
            expect(KPI_BY_ID[k.id]).toBeDefined();
        }
    });

    it("marks acquisition traffic metrics as external-only", () => {
        const external = KPI_DEFINITIONS.filter((k) => k.category === "acquisition");
        expect(external.every((k) => !k.computable)).toBe(true);
    });
});
