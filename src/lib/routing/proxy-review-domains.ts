import { NextResponse } from "next/server";

import {
    getMarketingSiteOrigin,
    isBusinessSlugPath,
    isPlatformRoute,
} from "@/lib/routing/platform-routes";

import type { ProxyContext } from "./proxy-context";

/** Hosts that serve public review capture only — no marketing site. */
export const REVIEW_CAPTURE_DOMAINS = [
    "collectratings.com",
    "www.collectratings.com",
    "ratingcollect.com",
    "www.ratingcollect.com",
];

export function isReviewCaptureDomain(hostname: string): boolean {
    return REVIEW_CAPTURE_DOMAINS.includes(hostname);
}

/** Handles requests to collectratings.com / ratingcollect.com. */
export function handleReviewCaptureDomain(ctx: ProxyContext): NextResponse {
    const { request, pathname, rootDomain } = ctx;

    // Root has no marketing site — review capture only.
    if (pathname === "/") {
        return new NextResponse("", { status: 404 });
    }

    // Platform/marketing paths belong on zyenereviews.com, and anything that
    // isn't a single-segment business slug is not a capture URL either.
    if (isPlatformRoute(pathname) || !isBusinessSlugPath(pathname)) {
        const target = new URL(pathname, getMarketingSiteOrigin(rootDomain));
        target.search = request.nextUrl.search;
        return ctx.withSessionCookies(NextResponse.redirect(target, 301));
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/r${pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}`;
    return ctx.withSessionCookies(NextResponse.rewrite(rewriteUrl));
}
