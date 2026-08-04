import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import {
    customersToCaseStudiesRedirect,
    getAuthSiteOrigin,
    isAuthPageRoute,
} from "@/lib/routing/platform-routes";

import { readOnboardingRow, type ProxyContext } from "./proxy-context";

/**
 * Local development routes by path rather than subdomain, since subdomains are
 * awkward on localhost. Mirrors the app-subdomain auth and onboarding gates.
 */
async function handleLocalhostRouting(ctx: ProxyContext): Promise<NextResponse> {
    const { request, pathname, user } = ctx;

    // Allow public review requests route
    if (pathname.startsWith("/r/")) return ctx.response();

    // Allow onboarding path only for first-time users.
    if (pathname.startsWith("/onboarding")) {
        if (!user) {
            return ctx.withSessionCookies(NextResponse.redirect(new URL("/login", request.url)));
        }

        try {
            const data = await readOnboardingRow(ctx, user.id);
            if (data?.onboarding_completed) {
                return ctx.withSessionCookies(
                    NextResponse.redirect(new URL("/dashboard", request.url)),
                );
            }
        } catch (error) {
            logger.error({ err: error }, "Onboarding status check failed:");
        }

        return ctx.response();
    }

    if (pathname.startsWith("/dashboard")) {
        if (!user) {
            return ctx.withSessionCookies(NextResponse.redirect(new URL("/login", request.url)));
        }

        try {
            const data = await readOnboardingRow(ctx, user.id);
            if (data && !data.onboarding_completed) {
                return ctx.withSessionCookies(
                    NextResponse.redirect(new URL("/onboarding", request.url)),
                );
            }
        } catch (error) {
            // If check fails, allow the request to proceed
            logger.error({ err: error }, "Onboarding status check failed:");
        }
    }

    // If accessing /login and logged in -> redirect /dashboard
    if (pathname === "/login" && user) {
        return ctx.withSessionCookies(NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    return ctx.response();
}

/** Handles requests to the apex domain and its www host. */
export async function handleRootDomain(
    ctx: ProxyContext,
    apexHost: string,
    wwwHost: string,
): Promise<NextResponse> {
    const { request, pathname, hostname, rootDomain } = ctx;
    const isLocalhost = rootDomain.includes("localhost");

    if (!isLocalhost && isAuthPageRoute(pathname)) {
        const authUrl = new URL(pathname, getAuthSiteOrigin(rootDomain));
        authUrl.search = request.nextUrl.search;
        return ctx.withSessionCookies(NextResponse.redirect(authUrl, 308));
    }

    // Permanent canonical host: apex → www (production only)
    if (hostname === apexHost && !isLocalhost) {
        const canonical = request.nextUrl.clone();
        canonical.protocol = "https:";
        canonical.hostname = wwwHost;
        return ctx.withSessionCookies(NextResponse.redirect(canonical, 308));
    }

    if (isLocalhost) return handleLocalhostRouting(ctx);

    // Landing page -> pass
    if (pathname === "/") return ctx.response();

    // Legacy blueprint alias: /customers → /case-studies
    // (the app subdomain serves the CRM at /customers).
    const caseStudiesRedirect = customersToCaseStudiesRedirect(pathname);
    if (caseStudiesRedirect) {
        return ctx.withSessionCookies(
            NextResponse.redirect(new URL(caseStudiesRedirect, request.url), 308),
        );
    }

    // Platform + marketing routes stay on zyenereviews.com (never → collectratings).
    // Unknown paths (including invalid single-segment URLs) fall through to Next.js not-found.
    return ctx.response();
}
