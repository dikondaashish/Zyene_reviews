/**
 * The crawler's only outbound fetch.
 *
 * `checkOriginIsPublic` validates the crawl origin once, before the crawl
 * starts. That is not enough on its own for two reasons, both reachable by a
 * tenant who controls the site being crawled:
 *
 *   1. Redirects. `fetch` follows them by default, so a public host can answer
 *      `302 Location: http://169.254.169.254/...` and the validated origin
 *      becomes irrelevant. Every hop is re-validated here.
 *   2. Discovered URLs. Sitemap and link discovery bound themselves to the
 *      site's own host, but this layer does not assume they did — it is the
 *      single choke point every crawl request passes through, so the invariant
 *      holds even if a future discovery path forgets.
 *
 * Also carries the two limits a crawler against an untrusted site needs and
 * plain `fetch` does not give you: a request timeout (a slow-loris response
 * otherwise pins an Inngest step until the platform kills it) and a response
 * body cap (page HTML is persisted verbatim, so an endless body is an
 * unbounded write).
 */
import type { FetchText } from "./discover-urls";
import { checkOriginIsPublic } from "./ssrf-guard";

export const CRAWL_TIMEOUT_MS = 15_000;
export const CRAWL_MAX_REDIRECTS = 5;
/** 5 MB. Well past any real HTML page; short of letting one response exhaust memory. */
export const CRAWL_MAX_BYTES = 5 * 1024 * 1024;

export type CrawlFetchOptions = {
    userAgent: string;
    timeoutMs?: number;
    maxRedirects?: number;
    maxBytes?: number;
    /** Injectable for tests. Defaults to the global `fetch`. */
    fetchImpl?: typeof fetch;
    /** Injectable for tests. Defaults to the real DNS-backed SSRF guard. */
    isPublic?: (url: string) => Promise<{ safe: boolean }>;
};

/** Read at most `maxBytes`, then stop pulling — an oversized body is truncated, not fatal. */
async function readTextCapped(response: Response, maxBytes: number): Promise<string> {
    if (!response.body) return "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let total = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) {
                text += decoder.decode(value.slice(0, value.byteLength - (total - maxBytes)));
                break;
            }
            text += decoder.decode(value, { stream: true });
        }
    } finally {
        await reader.cancel().catch(() => undefined);
    }
    return text;
}

function isRedirect(status: number): boolean {
    return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

/**
 * Builds the `FetchText` the crawler runs on. Returns `null` for anything that
 * failed or was refused — the crawler already treats null as "request failed"
 * and records it as a page-level finding, so a blocked address surfaces as an
 * unreachable page rather than a thrown crawl.
 */
export function createCrawlFetch(options: CrawlFetchOptions): FetchText {
    const timeoutMs = options.timeoutMs ?? CRAWL_TIMEOUT_MS;
    const maxRedirects = options.maxRedirects ?? CRAWL_MAX_REDIRECTS;
    const maxBytes = options.maxBytes ?? CRAWL_MAX_BYTES;
    const doFetch = options.fetchImpl ?? fetch;
    const isPublic = options.isPublic ?? checkOriginIsPublic;

    // One DNS resolution per host, not per page: a 1,000-page crawl of one site
    // would otherwise pay 1,000 identical lookups. Scoped to a single crawl, so
    // it cannot go stale across runs.
    const hostVerdicts = new Map<string, boolean>();

    async function hostIsPublic(url: string): Promise<boolean> {
        let host: string;
        try {
            host = new URL(url).host;
        } catch {
            return false;
        }
        const cached = hostVerdicts.get(host);
        if (cached !== undefined) return cached;
        const verdict = (await isPublic(url)).safe;
        hostVerdicts.set(host, verdict);
        return verdict;
    }

    return async function crawlFetch(url: string) {
        let current = url;

        for (let hop = 0; hop <= maxRedirects; hop += 1) {
            try {
                const parsed = new URL(current);
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
            } catch {
                return null;
            }

            if (!(await hostIsPublic(current))) return null;

            let response: Response;
            try {
                response = await doFetch(current, {
                    headers: { "User-Agent": options.userAgent },
                    redirect: "manual",
                    signal: AbortSignal.timeout(timeoutMs),
                });
            } catch {
                return null;
            }

            if (isRedirect(response.status)) {
                const location = response.headers.get("location");
                if (!location) return null;
                try {
                    current = new URL(location, current).toString();
                } catch {
                    return null;
                }
                continue;
            }

            try {
                return { ok: response.ok, status: response.status, text: await readTextCapped(response, maxBytes) };
            } catch {
                return null;
            }
        }

        // Ran out of hops: a redirect loop, or a chain longer than any real page needs.
        return null;
    };
}
