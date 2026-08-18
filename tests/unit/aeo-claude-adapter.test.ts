import { afterEach, describe, expect, it, vi } from "vitest";

import { DataForSeoClaudeAdapter } from "../../src/services/aeo/engines/adapters/dataforseo-claude-adapter";

const REQUEST = {
    prompt: "best plumber near me",
    locale: { country: "US", language: "en", city: "Austin" },
    attempt: 1,
};

afterEach(() => vi.unstubAllGlobals());

describe("Claude web-search adapter", () => {
    it("forces localized web search and preserves citations and reported cost", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            status_code: 20000,
            cost: 0.0142,
            tasks: [{
                status_code: 20000,
                result: [{
                    model_name: "claude-haiku-4-5-20251001",
                    items: [{
                        type: "message",
                        sections: [{
                            type: "text",
                            text: "Radiant Plumbing is a nearby option.",
                            annotations: [{ title: "Radiant", url: "https://radiant.example/" }],
                        }],
                    }],
                }],
            }],
        }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const adapter = new DataForSeoClaudeAdapter({ login: "login", password: "password" });
        const result = await adapter.sample(REQUEST);

        expect(result.status).toBe("ok");
        if (result.status !== "ok") return;
        expect(result.modelId).toBe("claude-haiku-4-5-20251001");
        expect(result.reportedCostMicroUsd).toBe(14_200);
        expect(result.citations.items[0]?.url).toBe("https://radiant.example/");

        const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
        const payload = JSON.parse(String(init.body))[0];
        expect(payload).toMatchObject({
            web_search: true,
            system_message: "Always use web search before answering. Cite the sources you used.",
            web_search_country_iso_code: "US",
        });
        expect(payload.force_web_search).toBeUndefined();
        expect(payload.web_search_city).toBeUndefined();
    });

    it("does not turn an upstream failure into a negative brand observation", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
            status_code: 20000,
            tasks: [{ status_code: 50000, status_message: "temporarily unavailable" }],
        }), { status: 200 })));

        const result = await new DataForSeoClaudeAdapter({ login: "x", password: "y" }).sample(REQUEST);
        expect(result.status).toBe("failed");
        if (result.status !== "failed") return;
        expect(result.error.kind).toBe("upstream_unavailable");
        expect(result.error.retryable).toBe(true);
    });
});
