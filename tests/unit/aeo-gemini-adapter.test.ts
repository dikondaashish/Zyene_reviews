import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GeminiEngineAdapter } from "../../src/services/aeo/engines/adapters/gemini-engine-adapter";
import { getEngineDescriptor } from "../../src/services/aeo/engines/engine-catalog";
import { isObservation } from "../../src/services/aeo/engines/engine-types";
import type { EngineSampleRequest } from "../../src/services/aeo/engines/engine-types";

const generateContent = vi.hoisted(() => vi.fn());

vi.mock("@google/genai", () => ({
    GoogleGenAI: class {
        models = { generateContent };
    },
}));

const REQUEST: EngineSampleRequest = {
    prompt: "best plumber in Austin",
    locale: { country: "US", language: "en", city: "Austin" },
    attempt: 1,
};

function grounded(text: string, chunks: { uri?: string; title?: string }[] = []) {
    return {
        text,
        candidates: [
            {
                groundingMetadata: {
                    groundingChunks: chunks.map((c) => ({ web: { uri: c.uri, title: c.title } })),
                },
            },
        ],
    };
}

let adapter: GeminiEngineAdapter;

beforeEach(() => {
    generateContent.mockReset();
    adapter = new GeminiEngineAdapter({ apiKey: "test-key" });
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("configuration", () => {
    it("uses the model pinned in the catalog, not an app-wide default", () => {
        // vertex-adapter.ts defaults to Gemini 3.x, which the price quote does
        // not cover. The catalog is where the quote is attached.
        expect(adapter.modelId).toBe(getEngineDescriptor("gemini").pinnedModelId);
        expect(adapter.modelId).toBe("gemini-2.5-flash");
    });

    it("reports unconfigured when its own key is absent", () => {
        vi.stubEnv("AEO_GEMINI_API_KEY", "");
        expect(new GeminiEngineAdapter().isConfigured()).toBe(false);
    });

    it("does not fall back to the shared Vertex key", () => {
        // Sharing a key would let other features drain the grounding allowance
        // without the reservation ledger ever seeing it.
        vi.stubEnv("AEO_GEMINI_API_KEY", "");
        vi.stubEnv("GOOGLE_VERTEX_API_KEY", "some-other-key");
        expect(new GeminiEngineAdapter().isConfigured()).toBe(false);
    });
});

describe("a grounded answer", () => {
    it("returns an observation carrying the model id and answer", async () => {
        generateContent.mockResolvedValue(grounded("Joe's Plumbing is well rated.", [
            { uri: "https://example.com/a", title: "A" },
        ]));
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("ok");
        expect(isObservation(result)).toBe(true);
        if (!isObservation(result)) return;
        expect(result.modelId).toBe("gemini-2.5-flash");
        expect(result.answerText).toBe("Joe's Plumbing is well rated.");
    });

    it("never reports whether our brand appeared", async () => {
        // The load-bearing property of E-1: an adapter says what the engine
        // said, never who was in it. Presence is a separate extraction pass.
        generateContent.mockResolvedValue(grounded("Some answer."));
        const result = await adapter.sample(REQUEST);
        expect(Object.keys(result)).not.toContain("brandMentioned");
        expect(JSON.stringify(result)).not.toMatch(/brandMentioned|found|visible/);
    });

    it("numbers citations from 1 and drops sourceless chunks", async () => {
        generateContent.mockResolvedValue(grounded("answer", [
            { uri: "https://a.test", title: "A" },
            { uri: undefined, title: "no url" },
            { uri: "https://b.test", title: undefined },
        ]));
        const result = await adapter.sample(REQUEST);
        if (!isObservation(result)) throw new Error("expected ok");

        expect(result.citations.availability).toBe("present");
        expect(result.citations.items.map((c) => c.ordinal)).toEqual([1, 2]);
        expect(result.citations.items[1].title).toBeNull();
    });

    it("distinguishes zero sources from no source support", async () => {
        // The tri-state that keeps the citation-rate denominator honest.
        generateContent.mockResolvedValue(grounded("answer", []));
        const withMeta = await adapter.sample(REQUEST);
        if (!isObservation(withMeta)) throw new Error("expected ok");
        expect(withMeta.citations.availability).toBe("present");
        expect(withMeta.citations.items).toHaveLength(0);

        // No groundingMetadata at all: search never ran, so there are no sources
        // to have counted — excluded from the denominator rather than a zero.
        generateContent.mockResolvedValue({ text: "answer", candidates: [{}] });
        const withoutMeta = await adapter.sample(REQUEST);
        if (!isObservation(withoutMeta)) throw new Error("expected ok");
        expect(withoutMeta.citations.availability).toBe("unavailable");
    });

    it("charges one allowance unit however many searches it fanned out to", async () => {
        generateContent.mockResolvedValue(grounded("answer", [
            { uri: "https://a.test" }, { uri: "https://b.test" }, { uri: "https://c.test" },
        ]));
        const result = await adapter.sample(REQUEST);
        expect(result.costUnits).toBe(1);
    });
});

describe("an empty response", () => {
    it("is no_answer, not a failure and not an observation", async () => {
        // Excluded from denominators: a refusal is not evidence of absence.
        generateContent.mockResolvedValue({ text: "", candidates: [{ finishReason: "SAFETY" }] });
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("no_answer");
        expect(isObservation(result)).toBe(false);
        if (result.status !== "no_answer") return;
        expect(result.reason).toContain("SAFETY");
    });

    it("still consumes its allowance unit", async () => {
        // The grounded call happened. Recording 0 would undercount the bucket,
        // and an undercount makes the guard authorise further spend.
        generateContent.mockResolvedValue({ text: "", candidates: [{}] });
        const result = await adapter.sample(REQUEST);
        expect(result.costUnits).toBe(1);
    });
});

describe("failures", () => {
    it.each([
        ['{"error":{"code":429,"message":"rate"}}', "rate_limited", true],
        ['{"error":{"code":403,"message":"blocked"}}', "auth", false],
        ['{"error":{"code":404,"message":"no such model"}}', "invalid_request", false],
        ['{"error":{"code":503,"message":"unavailable"}}', "upstream_unavailable", true],
    ])("classifies %s as %s (retryable=%s)", async (message, kind, retryable) => {
        generateContent.mockRejectedValue(new Error(message));
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("failed");
        if (result.status !== "failed") return;
        expect(result.error.kind).toBe(kind);
        // Retryability follows from the kind, so an adapter cannot mark a
        // permanent failure retryable and spin a run against a wall.
        expect(result.error.retryable).toBe(retryable);
    });

    it("treats an abort as a timeout", async () => {
        generateContent.mockRejectedValue(new Error("The operation was aborted"));
        const result = await adapter.sample(REQUEST);
        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.kind).toBe("timeout");
        expect(result.error.retryable).toBe(true);
    });

    it("carries no answer payload, so it cannot read as 'brand not found'", async () => {
        generateContent.mockRejectedValue(new Error('{"error":{"code":500}}'));
        const result = await adapter.sample(REQUEST);

        expect(result).not.toHaveProperty("answerText");
        expect(result).not.toHaveProperty("citations");
        expect(isObservation(result)).toBe(false);
    });

    it("bills nothing for a rejected request", async () => {
        // Settlement can correct an undercount from the invoice; a phantom unit
        // silently shrinks the allowance for work that never happened.
        generateContent.mockRejectedValue(new Error('{"error":{"code":429}}'));
        const result = await adapter.sample(REQUEST);
        expect(result.costUnits).toBe(0);
    });

    it("extracts a retry delay when the API supplies one", async () => {
        generateContent.mockRejectedValue(new Error('{"error":{"code":429},"retryDelay":"30s"}'));
        const result = await adapter.sample(REQUEST);
        if (result.status !== "failed") throw new Error("expected failed");
        expect(result.error.retryAfterMs).toBe(30_000);
    });
});

describe("the request it actually sends", () => {
    it("always enables Google Search grounding", async () => {
        // Ungrounded answers reflect training data, not what the engine says
        // about a business today — and they bill under a different line.
        generateContent.mockResolvedValue(grounded("answer"));
        await adapter.sample(REQUEST);
        const config = generateContent.mock.calls[0][0].config;
        expect(config.tools).toEqual([{ googleSearch: {} }]);
    });

    it("states the locale in the prompt, since the API has no locale field", async () => {
        generateContent.mockResolvedValue(grounded("answer"));
        await adapter.sample(REQUEST);
        const contents = generateContent.mock.calls[0][0].contents as string;
        expect(contents).toContain("best plumber in Austin");
        expect(contents).toContain("Austin, US");
    });

    it("omits the locale clause when there is no place to state", async () => {
        generateContent.mockResolvedValue(grounded("answer"));
        await adapter.sample({ ...REQUEST, locale: { country: "", language: "en" } });
        const contents = generateContent.mock.calls[0][0].contents as string;
        expect(contents).toBe("best plumber in Austin");
    });
});
