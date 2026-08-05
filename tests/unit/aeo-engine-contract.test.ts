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

    it("withholds a fully wired engine whose pricing is unconfirmed", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("claude"));
        // Anthropic rates are not contracted yet; being wired is not enough.
        expect(isMeterable("claude")).toBe(false);
        expect(registry.describe("claude").state).toBe("pricing_unconfirmed");
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
    it("keeps priced engines and withholds unpriced ones from the same request", () => {
        const registry = new EngineRegistry();
        registry.register(adapter("google_serp"));
        registry.register(adapter("claude"));

        const { runnable, withheld } = registry.resolveRunnable(["google_serp", "claude"]);

        expect(runnable.map((a) => a.id)).toEqual(["google_serp"]);
        expect(withheld.map((w) => w.state)).toEqual(["pricing_unconfirmed"]);
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
    it("pins Gemini to the model its grounding quote covers, not the app-wide default", () => {
        // The rest of the app runs Gemini 3.x; the quote covers 2.0/2.5 only.
        expect(getEngineDescriptor("gemini").pinnedModelId).toBe("gemini-2.5-pro");
    });

    it("charges nothing inside the free daily grounding allowance", () => {
        expect(estimateDailyCostMicroUsd("gemini", 10_000)).toBe(0);
    });

    it("charges $35 per 1,000 only on grounding prompts past the allowance", () => {
        // 11,000 samples => 1,000 billable => $35.00 => 35,000,000 micro-USD.
        expect(estimateDailyCostMicroUsd("gemini", 11_000)).toBe(35_000_000);
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
