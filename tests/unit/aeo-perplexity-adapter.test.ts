import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PerplexityEngineAdapter } from "../../src/services/aeo/engines/adapters/perplexity-engine-adapter";
import { getEngineDescriptor } from "../../src/services/aeo/engines/engine-catalog";
import { isObservation } from "../../src/services/aeo/engines/engine-types";
import type { EngineSampleRequest } from "../../src/services/aeo/engines/engine-types";

const REQUEST: EngineSampleRequest = {
    prompt: "best plumber in Austin",
    locale: { country: "US", language: "en", city: "Austin" },
    attempt: 1,
};

function reply(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
    return new Response(JSON.stringify(body), {
        status: init.status ?? 200,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    });
}

function answer(content: string, extra: Record<string, unknown> = {}) {
    return {
        model: "sonar",
        choices: [{ message: { content }, finish_reason: "stop" }],
        usage: { cost: { total_cost: 0.00532 } },
        ...extra,
    };
}

let adapter: PerplexityEngineAdapter;
const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    adapter = new PerplexityEngineAdapter({ apiKey: "test-key" });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe("endpoint and model", () => {
    it("calls chat/completions, not the search endpoint", async () => {
        // /search returns ranked links. Measuring those instead of the answer
        // would quietly turn this back into rank tracking.
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        expect(fetchMock.mock.calls[0][0]).toBe("https://api.perplexity.ai/chat/completions");
    });

    it("uses the model pinned in the catalog", async () => {
        expect(adapter.modelId).toBe(getEngineDescriptor("perplexity").pinnedModelId);
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("sonar");
    });

    it("records the model that actually answered, not the one requested", async () => {
        // Vendors substitute models. A trend line that silently spans two of
        // them is uninterpretable later.
        fetchMock.mockResolvedValue(reply({ ...answer("hi"), model: "sonar-pro" }));
        const result = await adapter.sample(REQUEST);
        expect(result.modelId).toBe("sonar-pro");
    });

    it("is unconfigured without its key", () => {
        vi.stubEnv("PERPLEXITY_API_KEY", "");
        expect(new PerplexityEngineAdapter().isConfigured()).toBe(false);
    });
});

describe("vendor-reported cost", () => {
    it("reports the invoice, not the catalog estimate", async () => {
        // $0.00532 reported vs the catalog's $0.0067 estimate — a 26% gap that
        // would compound silently across a month if the estimate were used.
        fetchMock.mockResolvedValue(reply(answer("hi")));
        const result = await adapter.sample(REQUEST);
        expect(result.reportedCostMicroUsd).toBe(5_320);
        expect(getEngineDescriptor("perplexity").cost.overageMicroUsd).toBe(6_700);
    });

    it("omits the field entirely when the vendor reports nothing", async () => {
        // Absent must mean "unknown", never "free" — the ledger treats a
        // reported 0 as authoritative.
        fetchMock.mockResolvedValue(reply({ ...answer("hi"), usage: {} }));
        const result = await adapter.sample(REQUEST);
        expect(result.reportedCostMicroUsd).toBeUndefined();
        expect("reportedCostMicroUsd" in result).toBe(false);
    });

    it("keeps a reported zero, which is a real claim of no charge", async () => {
        fetchMock.mockResolvedValue(reply({ ...answer("hi"), usage: { cost: { total_cost: 0 } } }));
        const result = await adapter.sample(REQUEST);
        expect(result.reportedCostMicroUsd).toBe(0);
    });

    it("drops a nonsensical figure rather than treating it as free", async () => {
        fetchMock.mockResolvedValue(reply({ ...answer("hi"), usage: { cost: { total_cost: -1 } } }));
        const result = await adapter.sample(REQUEST);
        expect(result.reportedCostMicroUsd).toBeUndefined();
    });
});

describe("citations", () => {
    it("joins titles from search_results onto the citation urls", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi", {
            citations: ["https://a.test", "https://b.test"],
            search_results: [{ url: "https://a.test", title: "Alpha" }],
        })));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");

        expect(result.citations.items).toEqual([
            { url: "https://a.test", title: "Alpha", ordinal: 1 },
            { url: "https://b.test", title: null, ordinal: 2 },
        ]);
    });

    it("preserves citation order, which is the prominence signal", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi", {
            citations: ["https://c.test", "https://a.test", "https://b.test"],
            search_results: [{ url: "https://a.test", title: "A" }],
        })));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");
        expect(result.citations.items.map((c) => c.url)).toEqual([
            "https://c.test", "https://a.test", "https://b.test",
        ]);
    });

    it("treats zero sources as a real zero, never as 'no source support'", async () => {
        // Sonar is search-grounded, so an empty list belongs in the citation-rate
        // denominator. `unavailable` is for engines with no notion of sources.
        fetchMock.mockResolvedValue(reply(answer("hi", { citations: [], search_results: [] })));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");
        expect(result.citations.availability).toBe("present");
        expect(result.citations.items).toHaveLength(0);
    });

    it("falls back to search_results when citations is absent", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi", {
            search_results: [{ url: "https://only.test", title: "Only" }],
        })));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");
        expect(result.citations.items).toHaveLength(1);
    });
});

describe("failures", () => {
    it.each([
        [429, "rate_limited", true],
        [401, "auth", false],
        [402, "quota_exhausted", false],
        [422, "invalid_request", false],
        [503, "upstream_unavailable", true],
    ])("maps HTTP %i to %s (retryable=%s)", async (status, kind, retryable) => {
        fetchMock.mockResolvedValue(reply({ error: "nope" }, { status }));
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("failed");
        if (result.status !== "failed") return;
        expect(result.error.kind).toBe(kind);
        expect(result.error.retryable).toBe(retryable);
    });

    it("bills nothing for a rejected request", async () => {
        fetchMock.mockResolvedValue(reply({ error: "nope" }, { status: 429 }));
        const result = await adapter.sample(REQUEST);
        expect(result.costUnits).toBe(0);
        expect(result.reportedCostMicroUsd).toBeUndefined();
    });

    it("carries no answer payload, so it cannot read as 'brand not found'", async () => {
        fetchMock.mockResolvedValue(reply({ error: "boom" }, { status: 500 }));
        const result = await adapter.sample(REQUEST);
        expect(result).not.toHaveProperty("answerText");
        expect(result).not.toHaveProperty("citations");
        expect(isObservation(result)).toBe(false);
    });

    it("reads Retry-After when the vendor sends one", async () => {
        fetchMock.mockResolvedValue(reply({}, { status: 429, headers: { "retry-after": "12" } }));
        const result = await adapter.sample(REQUEST);
        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.retryAfterMs).toBe(12_000);
    });

    it("survives a body that is not JSON", async () => {
        fetchMock.mockResolvedValue(new Response("<html>502</html>", { status: 200 }));
        const result = await adapter.sample(REQUEST);
        expect(result.status).toBe("failed");
    });

    it("classifies a network abort as a timeout", async () => {
        fetchMock.mockRejectedValue(new Error("The operation was aborted"));
        const result = await adapter.sample(REQUEST);
        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.kind).toBe("timeout");
    });
});

describe("an empty answer", () => {
    it("is no_answer and still consumes its billable unit", async () => {
        // The request completed and Perplexity charged for it, whatever it said.
        fetchMock.mockResolvedValue(reply({
            model: "sonar",
            choices: [{ message: { content: "" }, finish_reason: "length" }],
            usage: { cost: { total_cost: 0.004 } },
        }));
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("no_answer");
        expect(isObservation(result)).toBe(false);
        expect(result.costUnits).toBe(1);
        expect(result.reportedCostMicroUsd).toBe(4_000);
    });
});

describe("locale", () => {
    it("states it in the prompt, since the API has no locale field", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        const content = JSON.parse(fetchMock.mock.calls[0][1].body).messages[0].content;
        expect(content).toContain("Austin, US");
    });
});
