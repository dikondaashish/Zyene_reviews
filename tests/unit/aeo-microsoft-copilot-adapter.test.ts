import { afterEach, describe, expect, it, vi } from "vitest";

import { MicrosoftCopilotAdapter } from "../../src/services/aeo/engines/adapters/microsoft-copilot-adapter";

const REQUEST = {
    prompt: "best reputation management platform",
    locale: { country: "US", language: "en", city: "Kansas City" },
    attempt: 1,
};

function response(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe("Microsoft 365 Copilot adapter", () => {
    it("requires both the delegated token and explicit preview activation", () => {
        vi.stubEnv("MICROSOFT_COPILOT_ACCESS_TOKEN", "delegated-token");
        vi.stubEnv("AEO_ENABLE_COPILOT_PREVIEW", "false");
        expect(new MicrosoftCopilotAdapter().isConfigured()).toBe(false);

        vi.stubEnv("AEO_ENABLE_COPILOT_PREVIEW", "true");
        expect(new MicrosoftCopilotAdapter().isConfigured()).toBe(true);
    });

    it("creates a conversation, sends localized web-enabled chat, and preserves citations", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(response({ id: "conversation-1" }, 201))
            .mockResolvedValueOnce(response({
                messages: [{
                    text: "Zyene Reviews is one option.",
                    attributions: [
                        { attributionType: "citation", providerDisplayName: "Zyene", seeMoreWebUrl: "https://www.zyenereviews.com/" },
                        { attributionType: "other", providerDisplayName: "Ignored", seeMoreWebUrl: "https://example.com/" },
                    ],
                }],
            }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await new MicrosoftCopilotAdapter({ accessToken: "delegated-token", enabled: true }).sample(REQUEST);

        expect(result.status).toBe("ok");
        if (result.status !== "ok") return;
        expect(result.answerText).toBe("Zyene Reviews is one option.");
        expect(result.citations.items).toEqual([
            { url: "https://www.zyenereviews.com/", title: "Zyene", ordinal: 1 },
        ]);

        expect(fetchMock.mock.calls[0]?.[0]).toBe("https://graph.microsoft.com/beta/copilot/conversations");
        expect(fetchMock.mock.calls[1]?.[0]).toBe("https://graph.microsoft.com/beta/copilot/conversations/conversation-1/chat");
        const init = fetchMock.mock.calls[1]?.[1] as RequestInit;
        expect(init.headers).toMatchObject({ Authorization: "Bearer delegated-token" });
        expect(JSON.parse(String(init.body))).toMatchObject({
            message: { text: expect.stringContaining("Kansas City, US") },
            contextualResources: { webContext: { isWebEnabled: true } },
        });
    });

    it("fails closed when the delegated token is rejected", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ error: "invalid_token" }, 401)));
        const result = await new MicrosoftCopilotAdapter({ accessToken: "expired", enabled: true }).sample(REQUEST);

        expect(result.status).toBe("failed");
        if (result.status !== "failed") return;
        expect(result.error.kind).toBe("auth");
        expect(result.costUnits).toBe(0);
    });
});
