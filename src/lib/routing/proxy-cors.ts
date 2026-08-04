import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js sends several internal prefetch/RSC headers across subdomains, so
 * preflight has to allow all of them explicitly.
 */
const ALLOWED_REQUEST_HEADERS =
    "Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url, next-router-segment-prefetch";

/** Origins allowed on OPTIONS preflight — includes the www apex. */
export function preflightAllowedOrigins(rootDomain: string): string[] {
    return [
        `https://auth.${rootDomain}`,
        `https://app.${rootDomain}`,
        `https://${rootDomain}`,
        `https://www.${rootDomain}`,
    ];
}

/** Origins that get CORS headers on normal responses — no www apex. */
export function responseAllowedOrigins(rootDomain: string): string[] {
    return [
        `https://auth.${rootDomain}`,
        `https://app.${rootDomain}`,
        `https://${rootDomain}`,
    ];
}

/**
 * True when the browser Origin matches this request's Host (same deployment /
 * custom review domains like collectratings.com).
 */
export function originMatchesRequestHost(
    origin: string | null | undefined,
    hostHeader: string,
): boolean {
    if (!origin || !hostHeader) return false;
    try {
        const url = new URL(origin);
        const requestHost = hostHeader.split(":")[0]?.toLowerCase() ?? "";
        return url.hostname.toLowerCase() === requestHost;
    } catch {
        return false;
    }
}

/**
 * OPTIONS preflight requests must NEVER be redirected. Returns 204 with CORS
 * headers for known origins, bare 204 otherwise.
 */
export function handleCorsPreflight(request: NextRequest, rootDomain: string): NextResponse {
    const origin = request.headers.get("origin") || "";

    if (preflightAllowedOrigins(rootDomain).includes(origin)) {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": ALLOWED_REQUEST_HEADERS,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    return new NextResponse(null, { status: 204 });
}
