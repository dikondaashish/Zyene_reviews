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
});
