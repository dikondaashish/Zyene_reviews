import { describe, expect, it } from "vitest";

import { planRun, type PromptToSample } from "../../src/services/aeo/orchestration/run-plan";
import { EngineRegistry } from "../../src/services/aeo/engines/engine-registry";
import { FixtureEngineAdapter } from "../../src/services/aeo/engines/adapters/fixture-engine-adapter";
import type { AnswerEngineAdapter, AnswerEngineId } from "../../src/services/aeo/engines/engine-types";

const PROMPTS: PromptToSample[] = [
    { promptId: "p1", promptText: "best plumber in Austin", locale: { country: "US", language: "en" } },
    { promptId: "p2", promptText: "emergency plumber near me", locale: { country: "US", language: "en" } },
];

function registryWith(...ids: AnswerEngineId[]): EngineRegistry {
    const registry = new EngineRegistry();
    for (const id of ids) {
        registry.register(new FixtureEngineAdapter({ id, modelId: `${id}-fixture` }));
    }
    return registry;
}

const INPUT = {
    runId: "run-1",
    businessId: "biz-1",
    organizationId: "org-1",
    usageDate: "2026-08-06",
    prompts: PROMPTS,
    requestedEngines: ["gemini"] as AnswerEngineId[],
};

describe("fan-out", () => {
    it("emits one dispatch per prompt x engine x attempt", () => {
        const plan = planRun(
            { ...INPUT, requestedEngines: ["gemini", "perplexity"], attemptsPerPrompt: 3 },
            registryWith("gemini", "perplexity")
        );
        expect(plan.dispatches).toHaveLength(2 * 2 * 3);
        expect(plan.emptyReason).toBeNull();
    });

    it("gives every unit a distinct idempotency grain", () => {
        const plan = planRun({ ...INPUT, attemptsPerPrompt: 2 }, registryWith("gemini"));
        const keys = plan.dispatches.map(
            (d) => `${d.runId}:${d.promptId}:${d.engineId}:${d.attempt}`
        );
        // Colliding keys would make two different units resolve to one
        // reservation, and the second would silently never run.
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("defaults to a single observation per prompt", () => {
        const plan = planRun(INPUT, registryWith("gemini"));
        expect(plan.dispatches).toHaveLength(2);
        expect(plan.dispatches.every((d) => d.attempt === 1)).toBe(true);
    });
});

describe("engines are withheld before they are costed", () => {
    it("withholds an engine with no adapter registered", () => {
        const plan = planRun(INPUT, new EngineRegistry());
        expect(plan.dispatches).toHaveLength(0);
        expect(plan.emptyReason).toBe("no_runnable_engines");
        expect(plan.withheld.map((w) => w.state)).toEqual(["not_implemented"]);
    });

    it("allows the priced Phase 2 Claude adapter", () => {
        const plan = planRun(
            { ...INPUT, requestedEngines: ["claude"] },
            registryWith("claude")
        );
        expect(plan.dispatches).toHaveLength(PROMPTS.length);
        expect(plan.withheld).toEqual([]);
    });

    it("never costs a withheld engine", () => {
        const plan = planRun(
            { ...INPUT, requestedEngines: ["gemini", "claude"] },
            registryWith("gemini", "claude")
        );
        expect(plan.budgets.map((b) => b.engineId)).toEqual(["gemini", "claude"]);
    });

    it("withholds an unconfigured adapter", () => {
        const registry = new EngineRegistry();
        const unconfigured: AnswerEngineAdapter = {
            id: "gemini",
            modelId: "gemini-2.5-pro",
            isConfigured: () => false,
            sample: async () => {
                throw new Error("must not be called");
            },
        };
        registry.register(unconfigured);
        const plan = planRun(INPUT, registry);
        expect(plan.withheld.map((w) => w.state)).toEqual(["not_configured"]);
    });
});

describe("the plan respects what the day has already spent", () => {
    const many: PromptToSample[] = Array.from({ length: 200 }, (_, i) => ({
        promptId: `p${i}`,
        promptText: `prompt ${i}`,
        locale: { country: "US", language: "en" },
    }));

    it("clips the fan-out to the allowance instead of emitting doomed children", () => {
        // 1,450 of Gemini's 1,500 daily units are gone; 200 prompts are wanted.
        const plan = planRun(
            { ...INPUT, prompts: many, consumedByEngine: { gemini: 1_450 } },
            registryWith("gemini")
        );
        expect(plan.dispatches).toHaveLength(50);
        expect(plan.projectedDeferredUnits).toBe(150);
    });

    it("emits nothing at all once the allowance is gone", () => {
        const plan = planRun(
            { ...INPUT, prompts: many, consumedByEngine: { gemini: 1_500 } },
            registryWith("gemini")
        );
        expect(plan.dispatches).toHaveLength(0);
        expect(plan.emptyReason).toBe("budget_exhausted");
        expect(plan.projectedDeferredUnits).toBe(200);
    });

    it("treats an unspecified engine as having spent nothing", () => {
        const plan = planRun({ ...INPUT, consumedByEngine: {} }, registryWith("gemini"));
        expect(plan.dispatches).toHaveLength(2);
    });

    it("does not clip an engine that bills from request one", () => {
        // perplexity has no free bucket, so there is no allowance to protect and
        // the guard must not stand in the way of paid, authorised work.
        const plan = planRun(
            { ...INPUT, prompts: many, requestedEngines: ["perplexity"] },
            registryWith("perplexity")
        );
        expect(plan.dispatches).toHaveLength(200);
        expect(plan.projectedDeferredUnits).toBe(0);
    });
});

describe("empty runs say why", () => {
    it("distinguishes no prompts from no engines", () => {
        const noPrompts = planRun({ ...INPUT, prompts: [] }, registryWith("gemini"));
        expect(noPrompts.emptyReason).toBe("no_active_prompts");

        const noEngines = planRun({ ...INPUT, requestedEngines: [] }, registryWith("gemini"));
        expect(noEngines.emptyReason).toBe("no_runnable_engines");
    });
});

describe("authorisation is carried to every unit", () => {
    it("stamps overageAuthorised on each dispatch, not just the budget", () => {
        // The child reserves before it calls, and the reservation records the
        // authorisation. If it did not travel with the unit, a crash between
        // planning and dispatch would lose it.
        const plan = planRun({ ...INPUT, overageAuthorised: true }, registryWith("gemini"));
        expect(plan.dispatches.every((d) => d.overageAuthorised)).toBe(true);
    });

    it("defaults to unauthorised", () => {
        const plan = planRun(INPUT, registryWith("gemini"));
        expect(plan.dispatches.every((d) => !d.overageAuthorised)).toBe(true);
    });
});
