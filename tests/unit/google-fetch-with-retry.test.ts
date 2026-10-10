import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithRetry } from "@/services/google/business-profile-core";
import { logger } from "@/lib/logger";

describe("fetchWithRetry", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("logs transient retries at warn level, not error, so handled 503s stay out of Sentry", async () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
        const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
        const unavailable = new Response("unavailable", { status: 503, statusText: "Service Unavailable" });
        const ok = new Response(JSON.stringify({ placeActionLinks: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
        const fetchMock = vi.fn().mockResolvedValueOnce(unavailable).mockResolvedValueOnce(ok);
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithRetry("https://example.test/placeActionLinks", {}, 1, 0);

        expect(response.status).toBe(200);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[Google API] HTTP 503"));
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("still reports exhaustion at error level after the final retry fails", async () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
        const unavailable = new Response("unavailable", { status: 503, statusText: "Service Unavailable" });
        const fetchMock = vi.fn().mockResolvedValueOnce(unavailable);
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithRetry("https://example.test/placeActionLinks", {}, 0, 0);

        expect(response.status).toBe(503);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Upstream 503"));
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
        vi.spyOn(logger, "error").mockImplementation(() => {});
        vi.spyOn(logger, "warn").mockImplementation(() => {});
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
