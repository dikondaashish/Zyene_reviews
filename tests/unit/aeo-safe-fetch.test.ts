import { describe, expect, it, vi } from "vitest";

import { createCrawlFetch } from "../../src/services/aeo/crawler/safe-fetch";

const UA = "TestBot/1.0";

/** A fetch stand-in driven by a url -> Response map. */
function fakeFetch(routes: Record<string, Response>, log?: string[]): typeof fetch {
    return (async (input: string | URL | Request) => {
        const url = typeof input === "string" ? input : input.toString();
        log?.push(url);
        const res = routes[url];
        if (!res) throw new Error(`no route for ${url}`);
        return res;
    }) as unknown as typeof fetch;
}

function html(body: string, init?: ResponseInit): Response {
    return new Response(body, { status: 200, ...init });
}

function redirectTo(location: string, status = 302): Response {
    return new Response(null, { status, headers: { location } });
}

const allowAll = async () => ({ safe: true });

describe("createCrawlFetch — SSRF containment", () => {
    it("fetches an ordinary public page", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: fakeFetch({ "https://example.com/": html("<h1>hi</h1>") }),
            isPublic: allowAll,
        });
        expect(await fetchText("https://example.com/")).toEqual({
            ok: true,
            status: 200,
            text: "<h1>hi</h1>",
        });
    });

    it("refuses a URL whose host fails the SSRF guard", async () => {
        const impl = vi.fn();
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: impl as unknown as typeof fetch,
            isPublic: async () => ({ safe: false }),
        });
        expect(await fetchText("http://169.254.169.254/latest/meta-data/")).toBeNull();
        expect(impl).not.toHaveBeenCalled();
    });

    it("re-validates the redirect target — a public host cannot bounce us to link-local", async () => {
        const seen: string[] = [];
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: fakeFetch(
                {
                    "https://example.com/": redirectTo("http://169.254.169.254/latest/meta-data/"),
                    "http://169.254.169.254/latest/meta-data/": html("SECRET"),
                },
                seen
            ),
            isPublic: async (url) => ({ safe: !url.includes("169.254.169.254") }),
        });

        expect(await fetchText("https://example.com/")).toBeNull();
        // The redirect was seen, but never followed to the internal address.
        expect(seen).toEqual(["https://example.com/"]);
    });

    it("follows an ordinary redirect that stays public (http -> https, apex -> www)", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: fakeFetch({
                "http://example.com/": redirectTo("https://www.example.com/", 301),
                "https://www.example.com/": html("<h1>real page</h1>"),
            }),
            isPublic: allowAll,
        });
        expect(await fetchText("http://example.com/")).toEqual({
            ok: true,
            status: 200,
            text: "<h1>real page</h1>",
        });
    });

    it("resolves a relative Location header against the current URL", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: fakeFetch({
                "https://example.com/old": redirectTo("/new"),
                "https://example.com/new": html("moved"),
            }),
            isPublic: allowAll,
        });
        expect((await fetchText("https://example.com/old"))?.text).toBe("moved");
    });

    it("gives up on a redirect loop instead of spinning", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            maxRedirects: 3,
            fetchImpl: fakeFetch({
                "https://example.com/a": redirectTo("https://example.com/b"),
                "https://example.com/b": redirectTo("https://example.com/a"),
            }),
            isPublic: allowAll,
        });
        expect(await fetchText("https://example.com/a")).toBeNull();
    });

    it("refuses a non-http(s) scheme outright", async () => {
        const impl = vi.fn();
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: impl as unknown as typeof fetch,
            isPublic: allowAll,
        });
        expect(await fetchText("file:///etc/passwd")).toBeNull();
        expect(impl).not.toHaveBeenCalled();
    });

    it("resolves the SSRF verdict once per host, not once per page", async () => {
        const isPublic = vi.fn(async () => ({ safe: true }));
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: fakeFetch({
                "https://example.com/a": html("a"),
                "https://example.com/b": html("b"),
                "https://example.com/c": html("c"),
            }),
            isPublic,
        });
        await fetchText("https://example.com/a");
        await fetchText("https://example.com/b");
        await fetchText("https://example.com/c");
        expect(isPublic).toHaveBeenCalledTimes(1);
    });

    it("returns null rather than throwing when the request fails", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            fetchImpl: (async () => {
                throw new Error("network down");
            }) as unknown as typeof fetch,
            isPublic: allowAll,
        });
        expect(await fetchText("https://example.com/")).toBeNull();
    });
});

describe("createCrawlFetch — resource limits", () => {
    it("truncates a body past the cap rather than buffering it all", async () => {
        const fetchText = createCrawlFetch({
            userAgent: UA,
            maxBytes: 10,
            fetchImpl: fakeFetch({ "https://example.com/": html("x".repeat(5000)) }),
            isPublic: allowAll,
        });
        const result = await fetchText("https://example.com/");
        expect(result?.text.length).toBeLessThanOrEqual(10);
    });

    it("passes an abort signal so a hung response cannot pin the step open", async () => {
        let received: RequestInit | undefined;
        const fetchText = createCrawlFetch({
            userAgent: UA,
            timeoutMs: 1234,
            fetchImpl: (async (_url: string, init: RequestInit) => {
                received = init;
                return html("ok");
            }) as unknown as typeof fetch,
            isPublic: allowAll,
        });
        await fetchText("https://example.com/");
        expect(received?.signal).toBeInstanceOf(AbortSignal);
        expect(received?.redirect).toBe("manual");
    });
});
