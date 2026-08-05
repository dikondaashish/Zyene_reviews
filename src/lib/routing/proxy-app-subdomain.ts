import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getAuthSiteOrigin, getMarketingSiteOrigin } from "@/lib/routing/platform-routes";
import { safeNextPath } from "@/lib/routing/safe-next-path";

import { isRscRequest, readOnboardingRow, type ProxyContext } from "./proxy-context";

/** Redirects unauthenticated visitors to the auth subdomain's login page. */
function redirectToLogin(ctx: ProxyContext): NextResponse {
    const { request, pathname, rootDomain } = ctx;
    const requestedPath = safeNextPath(`${pathname}${request.nextUrl.search}`);
    const loginUrl = new URL("/login", getAuthSiteOrigin(rootDomain));
    loginUrl.searchParams.set("next", requestedPath);

    // For RSC/fetch requests from the auth subdomain, don't redirect (causes CORS error)
    const origin = request.headers.get("origin") || "";
    if (isRscRequest(request) && origin === `https://auth.${rootDomain}`) {
        const res = new NextResponse(JSON.stringify({ redirect: loginUrl.toString() }), {
            status: 401,
        });
        ctx.withCorsHeaders(res);
        return res;
    }

    return ctx.withSessionCookies(NextResponse.redirect(loginUrl));
}

/** Keeps first-time users in onboarding and returning users out of it. */
async function enforceOnboardingGate(
    ctx: ProxyContext,
    userId: string,
): Promise<NextResponse | null> {
    const { request, pathname } = ctx;

    try {
        const data = await readOnboardingRow(ctx, userId);

        // First-time users must complete onboarding before visiting app pages.
        if (!pathname.startsWith("/onboarding") && data && !data.onboarding_completed) {
            return ctx.withSessionCookies(
                NextResponse.redirect(new URL("/onboarding", request.url)),
            );
        }

        // Returning users should never revisit onboarding.
        if (pathname.startsWith("/onboarding") && data?.onboarding_completed) {
            return ctx.withSessionCookies(NextResponse.redirect(new URL("/", request.url)));
        }
    } catch (error) {
        // If check fails, allow the request to proceed
        logger.error({ err: error }, "Onboarding status check failed:");
    }

    return null;
}

/** Handles requests to app.<rootDomain>. */
export async function handleAppSubdomain(ctx: ProxyContext): Promise<NextResponse> {
    const { request, pathname, rootDomain, user } = ctx;

    // Docs should live on apex domain, not app subdomain.
    if (pathname.startsWith("/docs")) {
        return ctx.withSessionCookies(
            NextResponse.redirect(
                new URL(`${getMarketingSiteOrigin(rootDomain)}${pathname}`, request.url),
            ),
        );
    }

    // Public review carousel embed — no login; must not redirect to auth (iframes break).
    if (pathname.startsWith("/w/")) {
        return ctx.withSessionCookies(ctx.response());
    }

    if (!user) return redirectToLogin(ctx);

    const gateResponse = await enforceOnboardingGate(ctx, user.id);
    if (gateResponse) return gateResponse;

    // `/` rewrites to dashboard content; keep `/dashboard` as a first-class URL (no
    // redirect) so client navigations from other app pages avoid an extra round trip.
    if (pathname === "/") {
        return ctx.withSessionCookies(NextResponse.rewrite(new URL("/dashboard", request.url)));
    }

    // Legacy integrations URLs (pre–marketing /integrations page)
    if (pathname === "/integrations" || pathname.startsWith("/integrations/")) {
        const target = pathname.replace(/^\/integrations/, "/settings/integrations");
        return ctx.withSessionCookies(NextResponse.redirect(new URL(target, request.url)));
    }

    return ctx.response();
}
