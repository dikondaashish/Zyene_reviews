import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithRetry } from "@/services/google/business-profile-core";

describe("fetchWithRetry", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("retries when a successful response times out while its body is read", async () => {
        const timedOutResponse = new Response(JSON.stringify({ stale: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
        Object.defineProperty(timedOutResponse, "arrayBuffer", {
            value: vi.fn().mockRejectedValue(
                new DOMException("The operation was aborted due to timeout", "TimeoutError"),
            ),
        });
        const successfulResponse = new Response(JSON.stringify({ title: "Vindu Indian Restaurant" }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(timedOutResponse)
            .mockResolvedValueOnce(successfulResponse);
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithRetry("https://example.test/location", {}, 1, 0);

        await expect(response.json()).resolves.toEqual({ title: "Vindu Indian Restaurant" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("retries Google 503 UNAVAILABLE responses before returning the final failure", async () => {
        const unavailable = new Response("unavailable", { status: 503, statusText: "Service Unavailable" });
        const ok = new Response(JSON.stringify({ placeActionLinks: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
        const fetchMock = vi.fn().mockResolvedValueOnce(unavailable).mockResolvedValueOnce(ok);
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithRetry("https://example.test/placeActionLinks", {}, 1, 0);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ placeActionLinks: [] });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
