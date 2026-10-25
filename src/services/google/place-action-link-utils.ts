import type { PlaceActionLink } from "@/services/google/place-actions";
import { fetchPublicHttpBytes } from "@/services/aeo/crawler/public-http";

export function linkToRow(
    link: PlaceActionLink,
    reviewPlatformId: string,
    businessId: string,
    isBroken: boolean,
    lastCheck: string | null
): {
    review_platform_id: string;
    business_id: string;
    google_link_name: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
    last_link_check_at: string | null;
    updated_at: string;
} {
    return {
        review_platform_id: reviewPlatformId,
        business_id: businessId,
        google_link_name: link.name || "",
        place_action_type: link.placeActionType || "UNKNOWN",
        uri: link.uri || "",
        is_preferred: !!link.isPreferred,
        is_broken: isBroken,
        last_link_check_at: lastCheck,
        updated_at: new Date().toISOString(),
    };
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * Statuses that prove the page is gone or the server is failing. Anything else
 * (401/403/429/503 bot walls like Cloudflare challenges, 405 HEAD refusals)
 * only says the server refused an automated client, which real visitors pass.
 */
const BROKEN_STATUSES = new Set([404, 410, 500, 502, 504]);

/** Transport errors that are transient or WAF behavior, not proof of a dead link. */
const INCONCLUSIVE_ERRORS = new Set([
    "TimeoutError", "AbortError", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN",
    "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT", "UND_ERR_SOCKET",
]);

const CHECK_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
};

function isInconclusiveError(error: unknown): boolean {
    for (let current = error, depth = 0; current && depth < 4; depth++) {
        const { name, code, cause } = current as { name?: string; code?: string; cause?: unknown };
        if ((name && INCONCLUSIVE_ERRORS.has(name)) || (code && INCONCLUSIVE_ERRORS.has(code))) return true;
        current = cause;
    }
    return false;
}

/** HEAD first; servers that reject HEAD get a confirming GET before we judge them. */
async function requestHop(url: URL, deadline: number) {
    const request = (method: "HEAD" | "GET") => fetchPublicHttpBytes(url.href, {
        method, headers: CHECK_HEADERS, redirect: "manual",
        timeoutMs: Math.max(1, deadline - Date.now()), maxBytes: 0,
    });
    const head = await request("HEAD");
    if (head.status < 400 || Date.now() >= deadline) return head;
    return request("GET");
}

/**
 * Returns true only on definitive evidence the link is dead: a broken status,
 * an unsafe/unresolvable destination, or a redirect loop. Bot walls, rate
 * limits and timeouts return false so working links are never flagged.
 */
export async function checkUriLikelyBroken(uri: string): Promise<boolean> {
    const deadline = Date.now() + 8000;
    const visited = new Set<string>();
    try {
        let url = new URL(uri);
        for (let redirects = 0; redirects <= 3; redirects++) {
            if (Date.now() >= deadline) return false;
            if (visited.has(url.href)) return true;
            visited.add(url.href);
            // Reuse connection-time DNS validation for every destination/hop.
            const response = await requestHop(url, deadline);
            if (!REDIRECT_STATUSES.has(response.status)) return BROKEN_STATUSES.has(response.status);
            if (!response.location) return true;
            url = new URL(response.location, url);
        }
        return true;
    } catch (error) {
        return !isInconclusiveError(error);
    }
}
