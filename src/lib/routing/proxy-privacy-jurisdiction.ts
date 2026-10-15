import type { NextRequest, NextResponse } from "next/server";

import { sharedCookieDomain } from "@/lib/privacy/consent-record";
import {
    DEV_OVERRIDE_PARAM,
    GPC_HEADER,
    JURISDICTION_COOKIE_MAX_AGE,
    JURISDICTION_COOKIE_NAME,
    VERCEL_COUNTRY_HEADER,
    resolveJurisdictionCookie,
    serializeJurisdictionCookie,
    wantsJurisdictionCookie,
} from "@/lib/privacy/jurisdiction-cookie";

/**
 * Attaches the coarse privacy jurisdiction to page responses. Reads Vercel's
 * geolocation header directly (Next 16 removed `request.geo`; the
 * `@vercel/functions` `geolocation()` helper reads the same header). Nothing
 * about location is logged or stored beyond the jurisdiction label.
 */
export function withPrivacyJurisdiction(request: NextRequest, response: NextResponse): NextResponse {
    if (!wantsJurisdictionCookie(request.nextUrl.pathname)) return response;

    const existing = request.cookies.get(JURISDICTION_COOKIE_NAME)?.value ?? null;
    const value = serializeJurisdictionCookie(
        resolveJurisdictionCookie({
            country: request.headers.get(VERCEL_COUNTRY_HEADER),
            secGpc: request.headers.get(GPC_HEADER),
            existing,
            queryOverride: request.nextUrl.searchParams.get(DEV_OVERRIDE_PARAM),
            envOverride: process.env.PRIVACY_REGION_OVERRIDE,
            isProduction: process.env.NODE_ENV === "production",
        })
    );
    if (value === existing) return response;

    const hostname = (request.headers.get("host") ?? "").split(":")[0] ?? "";
    response.cookies.set(JURISDICTION_COOKIE_NAME, value, {
        path: "/",
        maxAge: JURISDICTION_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        // Read by the consent UI in the browser; holds no secret or identifier.
        httpOnly: false,
        domain: sharedCookieDomain(hostname),
    });
    return response;
}
