import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ConnectOptions = { connect: { lookup: (
    hostname: string, options: object,
    callback: (error: Error | null, address: string, family: number) => void,
) => void } };
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), fetch: vi.fn(), globalFetch: vi.fn() }));
vi.mock("node:dns", () => ({ promises: { lookup: mocks.lookup } }));
vi.mock("undici", () => ({
    Agent: class {
        constructor(public options: ConnectOptions) {}
        async close() {}
    },
    fetch: mocks.fetch,
}));

import { checkUriLikelyBroken } from "@/services/google/place-action-link-utils";

describe("Google place-action link SSRF boundary", () => {
    beforeEach(() => {
        mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
        mocks.fetch.mockResolvedValue(new Response(null, { status: 200 }));
        mocks.globalFetch.mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", mocks.globalFetch);
    });
    afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

    it.each([
        "http://169.254.169.254/latest/meta-data/", "http://127.0.0.1/",
        "http://10.0.0.1/", "http://[::1]/", "file:///etc/passwd",
        "https://user:password@example.com/",
    ])("rejects %s before any HTTP request", async uri => {
        expect(await checkUriLikelyBroken(uri)).toBe(true);
        expect(mocks.fetch).not.toHaveBeenCalled();
        expect(mocks.globalFetch).not.toHaveBeenCalled();
    });

    it("rejects a public redirect to a private address before the second request", async () => {
        mocks.fetch.mockResolvedValueOnce(new Response(null, {
            status: 302, headers: { location: "http://169.254.169.254/" },
        }));
        expect(await checkUriLikelyBroken("https://example.com/start")).toBe(true);
        expect(mocks.fetch).toHaveBeenCalledTimes(1);
        expect(mocks.globalFetch).not.toHaveBeenCalled();
    });

    it("preserves healthy public redirects without automatic following", async () => {
        mocks.fetch.mockResolvedValueOnce(new Response(null, {
            status: 301, headers: { location: "/booking" },
        }));
        expect(await checkUriLikelyBroken("https://example.com/start")).toBe(false);
        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        expect(mocks.fetch.mock.calls[1][0]).toBe("https://example.com/booking");
        for (const [, options] of mocks.fetch.mock.calls) {
            expect(options).toMatchObject({ method: "HEAD", redirect: "manual" });
            expect(options.dispatcher.options.connect.autoSelectFamily).toBe(false);
        }
    });

    it("blocks DNS rebinding at the actual connection lookup", async () => {
        mocks.lookup.mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }]);
        mocks.lookup.mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }]);
        mocks.fetch.mockImplementation(async (_url, options: { dispatcher: { options: ConnectOptions } }) => {
            await new Promise<void>((resolve, reject) => {
                options.dispatcher.options.connect.lookup("example.com", {}, error => {
                    if (error) reject(error); else resolve();
                });
            });
            throw new Error("The unsafe connection must never be reached");
        });
        expect(await checkUriLikelyBroken("https://example.com/")).toBe(true);
        expect(mocks.lookup).toHaveBeenCalledTimes(2);
        expect(mocks.globalFetch).not.toHaveBeenCalled();
    });

    it("stops redirect cycles", async () => {
        mocks.fetch.mockResolvedValue(new Response(null, { status: 302, headers: { location: "/start" } }));
        expect(await checkUriLikelyBroken("https://example.com/start")).toBe(true);
        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });

    it("bounds a chain of distinct redirects", async () => {
        mocks.fetch.mockImplementation(async url => new Response(null, {
            status: 302, headers: { location: `${url}x` },
        }));
        expect(await checkUriLikelyBroken("https://example.com/start")).toBe(true);
        expect(mocks.fetch.mock.calls.length).toBeLessThanOrEqual(4);
    });

    it.each([404, 503])("classifies HTTP %s as broken", async status => {
        mocks.fetch.mockResolvedValue(new Response(null, { status }));
        mocks.globalFetch.mockResolvedValue(new Response(null, { status }));
        expect(await checkUriLikelyBroken("https://example.com/")).toBe(true);
    });

    it("classifies transport failure as broken", async () => {
        mocks.fetch.mockRejectedValue(new Error("offline"));
        mocks.globalFetch.mockRejectedValue(new Error("offline"));
        expect(await checkUriLikelyBroken("https://example.com/")).toBe(true);
    });
});
