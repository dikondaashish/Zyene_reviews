import { NextResponse } from "next/server";

import { isRscRequest, type ProxyContext } from "./proxy-context";

/** Handles requests to auth.<rootDomain>. */
export function handleAuthSubdomain(ctx: ProxyContext): NextResponse {
    const { request, pathname, rootDomain, user } = ctx;

    if (user && pathname === "/") {
        const targetUrl = `https://app.${rootDomain}`;

        // A cross-origin redirect in response to an RSC fetch triggers a CORS
        // error, so signal the client router via x-middleware-redirect instead.
        if (isRscRequest(request)) {
            const res = new NextResponse(null, {
                status: 200,
                headers: {
                    "x-middleware-redirect": targetUrl,
                    Location: targetUrl,
                },
            });
            ctx.withCorsHeaders(res);
            ctx.response()
                .cookies.getAll()
                .forEach((cookie) => {
                    res.cookies.set(cookie);
                });
            return ctx.withNoIndex(res);
        }

        // Non-RSC navigations are allowed to redirect, but we must still attach
        // CORS headers so the browser doesn't block the redirected fetch.
        const redirectRes = ctx.withSessionCookies(
            NextResponse.redirect(new URL(targetUrl, request.url)),
        );
        ctx.withCorsHeaders(redirectRes);
        return ctx.withNoIndex(redirectRes);
    }

    // Rewrite root to /login
    if (pathname === "/") {
        return ctx.withNoIndex(
            ctx.withSessionCookies(NextResponse.rewrite(new URL("/login", request.url))),
        );
    }

    // Pass other paths (e.g. /signup, /forgot-password)
    return ctx.withNoIndex(ctx.withCorsHeaders(ctx.response()));
}
