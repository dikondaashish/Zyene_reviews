import { describe, expect, it } from "vitest";

import { EngineRegistry } from "../../src/services/aeo/engines/engine-registry";
import { FixtureEngineAdapter } from "../../src/services/aeo/engines/adapters/fixture-engine-adapter";
import {
    estimateDailyCostMicroUsd,
    getEngineDescriptor,
    isMeterable,
} from "../../src/services/aeo/engines/engine-catalog";
import {
    citationsPresent,
    citationsUnavailable,
    engineError,
    failedSample,
    noAnswerSample,
    okSample,
} from "../../src/services/aeo/engines/engine-result";
import { billableUnits, isObservation } from "../../src/services/aeo/engines/engine-types";

function adapter(id: Parameters<typeof getEngineDescriptor>[0], configured = true) {
    return new FixtureEngineAdapter({ id, modelId: `${id}-test-model`, configured });
}

describe("EngineRegistry availability", () => {
    it("reports an unregistered engine as not implemented, with its phase", () => {
        const registry = new EngineRegistry();
        const availability = registry.describe("copilot");
        expect(availability.state).toBe("not_implemented");
        expect(availability.reason).toContain("Phase 3");
    });

    it("reports a registered but unconfigured adapter as not configured", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("perplexity", false));
        expect(registry.describe("perplexity").state).toBe("not_configured");
    });

    it("allows Claude through the metered DataForSEO endpoint", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("claude"));
        expect(isMeterable("claude")).toBe(true);
        expect(registry.describe("claude").state).toBe("available");
    });

    it("allows Gemini now that its grounding rate is confirmed", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("gemini"));
        expect(isMeterable("gemini")).toBe(true);
        expect(registry.describe("gemini").state).toBe("available");
    });

    it("reports a configured, priced engine as available", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("google_serp"));
        expect(registry.describe("google_serp").state).toBe("available");
    });

    it("describes every catalogued engine, implemented or not", () => {
        const registry = new EngineRegistry();
        expect(registry.describeAll()).toHaveLength(8);
    });
});

describe("EngineRegistry.resolveRunnable", () => {
    it("keeps both priced engines in the same request", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("google_serp"));
        registry.register(adapter("claude"));

        const { runnable, withheld } = registry.resolveRunnable(["google_serp", "claude"]);

        expect(runnable.map((a) => a.id)).toEqual(["google_serp", "claude"]);
        expect(withheld).toEqual([]);
    });

    it("never returns an adapter that was never registered", () => {
        const registry = new EngineRegistry();
        const { runnable, withheld } = registry.resolveRunnable(["chatgpt"]);
        expect(runnable).toHaveLength(0);
        expect(withheld[0].state).toBe("not_implemented");
    });

    it("deduplicates repeated engine ids so a run cannot double-bill", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("google_serp"));
        const { runnable } = registry.resolveRunnable(["google_serp", "google_serp", "google_serp"]);
        expect(runnable).toHaveLength(1);
    });
});

describe("engine cost model", () => {
    it("pins Gemini to a model its grounding quote covers AND the project can call", () => {
        // Two independent constraints, both binding:
        //   - the quote covers the 2.0/2.5 generation only, so no 3.x model
        //   - of those, only 2.5 Flash is callable here; 2.5 Pro and
        //     2.5 Flash-Lite both 404 "no longer available to new users"
        expect(getEngineDescriptor("gemini").pinnedModelId).toBe("gemini-2.5-flash");
    });

    it("charges nothing inside the free daily grounding allowance", () => {
        // 1,500/day, SHARED across 2.0 Flash / 2.5 Flash / 2.5 Flash-Lite.
        expect(estimateDailyCostMicroUsd("gemini", 1_500)).toBe(0);
    });

    it("charges $35 per 1,000 only on grounding prompts past the allowance", () => {
        // 2,500 samples => 1,000 billable => $35.00 => 35,000,000 micro-USD.
        expect(estimateDailyCostMicroUsd("gemini", 2_500)).toBe(35_000_000);
    });

    it("does not still believe in the 2.5 Pro allowance", () => {
        // Regression guard on the specific stale number. 10,000/day belonged to
        // 2.5 Pro, which this project cannot call; leaving it in place would
        // have authorised ~6.7x the free spend that actually exists.
        expect(getEngineDescriptor("gemini").cost.freePerDay).toBe(1_500);
        expect(estimateDailyCostMicroUsd("gemini", 10_000)).toBeGreaterThan(0);
    });

    it("bills engines with no free allowance from the first sample", () => {
        expect(estimateDailyCostMicroUsd("chatgpt", 1)).toBe(25_000);
    });

    it("never returns a negative cost for an idle day", () => {
        expect(estimateDailyCostMicroUsd("gemini", 0)).toBe(0);
    });
});

describe("sample result invariants", () => {
    it("refuses to build an answered sample without a model id", () => {
        expect(() =>
            okSample({
                modelId: "   ",
                answerText: "anything",
                citations: citationsUnavailable(),
                latencyMs: 10,
                costUnits: 1,
            })
        ).toThrow(/non-empty modelId/);
    });

    it("assigns 1-based citation ordinals", () => {
        const citations = citationsPresent([{ url: "https://a.test" }, { url: "https://b.test" }]);
        expect(citations.items.map((c) => c.ordinal)).toEqual([1, 2]);
    });

    it("distinguishes 'engine has no citations' from 'engine returned none'", () => {
        // Collapsing these two would corrupt the citation-rate denominator.
        expect(citationsPresent([]).availability).toBe("present");
        expect(citationsUnavailable().availability).toBe("unavailable");
    });

    it("clamps negative cost and latency to zero", () => {
        const result = noAnswerSample({
            modelId: "m",
            reason: "refused",
            latencyMs: -5,
            costUnits: -3,
        });
        expect(result.latencyMs).toBe(0);
        expect(billableUnits(result)).toBe(0);
    });
});

describe("isObservation", () => {
    const base = { modelId: "m", latencyMs: 1, costUnits: 0 };

    it("counts only answered samples", () => {
        const ok = okSample({ ...base, answerText: "x", citations: citationsUnavailable(), costUnits: 1 });
        expect(isObservation(ok)).toBe(true);
    });

    // QA criterion #2: a transport failure must never read as "brand not found".
    it("excludes failures", () => {
        const failure = failedSample({
            modelId: "m",
            error: engineError("upstream_unavailable", "503"),
            latencyMs: 1,
        });
        expect(isObservation(failure)).toBe(false);
    });

    it("excludes refusals, which are not evidence of absence either", () => {
        expect(isObservation(noAnswerSample({ ...base, reason: "declined" }))).toBe(false);
    });
});

describe("engineError retryability", () => {
    it.each(["rate_limited", "upstream_unavailable", "timeout"] as const)("marks %s retryable", (kind) => {
        expect(engineError(kind, "x").retryable).toBe(true);
    });

    it.each(["auth", "invalid_request", "quota_exhausted", "unknown"] as const)(
        "marks %s terminal",
        (kind) => {
            expect(engineError(kind, "x").retryable).toBe(false);
        }
    );

    it("carries retryAfterMs only when supplied", () => {
        expect(engineError("rate_limited", "slow down", 2000).retryAfterMs).toBe(2000);
        expect(engineError("rate_limited", "slow down")).not.toHaveProperty("retryAfterMs");
    });
});

describe("FixtureEngineAdapter", () => {
    const request = { prompt: "best plumber in Austin", locale: { country: "US", language: "en" }, attempt: 1 };

    it("replays a scripted answer and records the call", async () => {
        const fixture = new FixtureEngineAdapter({
            id: "perplexity",
            modelId: "sonar-test",
            responses: new Map([
                [request.prompt, { kind: "ok", answerText: "Acme Plumbing", citations: [{ url: "https://acme.test" }] }],
            ]),
        });

        const result = await fixture.sample(request);

        expect(result.status).toBe("ok");
        if (result.status === "ok") {
            expect(result.answerText).toBe("Acme Plumbing");
            expect(result.citations.items).toHaveLength(1);
        }
        expect(fixture.calls).toEqual([request]);
    });

    it("surfaces scripted failures through the error contract", async () => {
        const fixture = new FixtureEngineAdapter({
            id: "chatgpt",
            modelId: "gpt-test",
            fallback: { kind: "failed", errorKind: "rate_limited", message: "429", retryAfterMs: 500 },
        });

        const result = await fixture.sample(request);

        expect(result.status).toBe("failed");
        if (result.status === "failed") {
            expect(result.error.retryable).toBe(true);
            expect(result.error.retryAfterMs).toBe(500);
        }
    });

    it("fails fast on an already-aborted signal", async () => {
        const fixture = new FixtureEngineAdapter({ id: "chatgpt", modelId: "gpt-test" });
        const controller = new AbortController();
        controller.abort();

        const result = await fixture.sample(request, controller.signal);

        expect(result.status).toBe("failed");
        expect(fixture.calls).toHaveLength(1);
    });

    it("costs nothing, so harness runs cannot bill", async () => {
        const fixture = new FixtureEngineAdapter({ id: "google_serp", modelId: "serp-test" });
        const result = await fixture.sample(request);
        expect(billableUnits(result)).toBe(0);
    });
});
