import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatGptEngineAdapter } from "../../src/services/aeo/engines/adapters/chatgpt-engine-adapter";
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

function answer(text: string, annotations: unknown[] = []) {
    return {
        model: "gpt-4o",
        status: "completed",
        output: [
            { type: "message", content: [{ type: "output_text", text, annotations }] },
        ],
        usage: { input_tokens: 20, output_tokens: 300 },
    };
}

let adapter: ChatGptEngineAdapter;
const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    adapter = new ChatGptEngineAdapter({ apiKey: "test-key" });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe("cost is never fabricated", () => {
    /**
     * The decisive property of this adapter. OpenAI reports TOKENS, not money.
     * `reportedCostMicroUsd` means "what the vendor said this cost" — the
     * invoice — so deriving a figure from tokens and filing it there would make
     * the ledger treat an estimate as fact. It would also undercount, because
     * the per-call web_search fee is not itemised, and undercounting is the
     * self-amplifying direction.
     */
    it("never reports a cost, even though tokens are available", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi")));
        const result = await adapter.sample(REQUEST);
        expect(result.reportedCostMicroUsd).toBeUndefined();
        expect("reportedCostMicroUsd" in result).toBe(false);
    });

    it("leaves the catalog rate honestly labelled an estimate", () => {
        // If this ever flips to "verified" without a real invoice to reconcile
        // against, the ledger starts asserting precision it does not have.
        expect(getEngineDescriptor("chatgpt").cost.confidence).toBe("estimated");
    });

    it("still counts the unit it consumed", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi")));
        const result = await adapter.sample(REQUEST);
        expect(result.costUnits).toBe(1);
    });
});

describe("the double-charge window", () => {
    it("sends an Idempotency-Key so a retry resolves to the same billed request", async () => {
        // The one engine wired so far where the crash-in-window case can be
        // closed rather than merely made visible.
        const keyed = new ChatGptEngineAdapter({ apiKey: "k", idempotencyKey: "run-1:p1:chatgpt:1" });
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await keyed.sample(REQUEST);
        expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBe("run-1:p1:chatgpt:1");
    });

    it("omits the header when no key was supplied, rather than inventing one", async () => {
        // A generated key would be new on every retry, which is worse than none:
        // it looks like protection while providing none.
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBeUndefined();
    });
});

describe("request shape", () => {
    it("uses the pinned model and the hosted web_search tool", async () => {
        expect(adapter.modelId).toBe(getEngineDescriptor("chatgpt").pinnedModelId);
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.model).toBe("gpt-4o");
        expect(body.tools).toEqual([{ type: "web_search" }]);
    });

    it("states the locale in the prompt", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi")));
        await adapter.sample(REQUEST);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).input).toContain("Austin, US");
    });

    it("is unconfigured without its key", () => {
        vi.stubEnv("OPENAI_API_KEY", "");
        expect(new ChatGptEngineAdapter().isConfigured()).toBe(false);
    });
});

describe("citations", () => {
    it("reads url_citation annotations off the text block", async () => {
        fetchMock.mockResolvedValue(reply(answer("hi", [
            { type: "url_citation", url: "https://a.test", title: "Alpha" },
            { type: "file_citation", url: "https://skip.test" },
            { type: "url_citation", url: "https://b.test" },
        ])));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");

        expect(result.citations.availability).toBe("present");
        expect(result.citations.items).toEqual([
            { url: "https://a.test", title: "Alpha", ordinal: 1 },
            { url: "https://b.test", title: null, ordinal: 2 },
        ]);
    });

    it("marks a search-free answer as having no source support, not zero sources", async () => {
        // The model can answer from training data without searching. That is not
        // a citation rate of zero — there was nothing to cite from — so it must
        // stay out of the denominator.
        fetchMock.mockResolvedValue(reply(answer("from memory", [])));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");
        expect(result.citations.availability).toBe("unavailable");
    });
});

describe("failures and empty output", () => {
    it.each([
        [429, "rate_limited"],
        [401, "auth"],
        [400, "invalid_request"],
        [500, "upstream_unavailable"],
    ])("maps HTTP %i to %s", async (status, kind) => {
        fetchMock.mockResolvedValue(reply({ error: {} }, { status }));
        const result = await adapter.sample(REQUEST);
        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.kind).toBe(kind);
        expect(result.costUnits).toBe(0);
    });

    /**
     * Found by a live call: the account had no credits, and OpenAI reports that
     * as 429 — the same status it uses for "slow down". Classified as
     * `rate_limited` it is RETRYABLE, so every dispatch of every run would burn
     * its full retry budget against an account that cannot pay. The body is the
     * only thing that distinguishes them.
     */
    it("treats a 429 that means 'no credits' as permanent, not retryable", async () => {
        fetchMock.mockResolvedValue(reply({
            error: { message: "You have no credits remaining.", type: "insufficient_quota" },
        }, { status: 429 }));
        const result = await adapter.sample(REQUEST);

        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.kind).toBe("quota_exhausted");
        expect(result.error.retryable).toBe(false);
    });

    it("still treats an ordinary 429 as retryable", async () => {
        fetchMock.mockResolvedValue(reply({
            error: { message: "Rate limit reached for gpt-4o", type: "requests" },
        }, { status: 429 }));
        const result = await adapter.sample(REQUEST);

        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.kind).toBe("rate_limited");
        expect(result.error.retryable).toBe(true);
    });

    it("carries no answer payload on failure", async () => {
        fetchMock.mockResolvedValue(reply({}, { status: 500 }));
        const result = await adapter.sample(REQUEST);
        expect(result).not.toHaveProperty("answerText");
        expect(isObservation(result)).toBe(false);
    });

    it("treats a truncated empty response as no_answer, still billed", async () => {
        fetchMock.mockResolvedValue(reply({
            model: "gpt-4o",
            status: "incomplete",
            incomplete_details: { reason: "max_output_tokens" },
            output: [],
        }));
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("no_answer");
        if (result.status !== "no_answer") return;
        expect(result.reason).toContain("max_output_tokens");
        expect(result.costUnits).toBe(1);
    });
});
