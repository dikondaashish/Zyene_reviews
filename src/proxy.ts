/**
 * Next.js middleware proxy — handles subdomain routing, auth session refresh,
 * API rate limiting, and CORS headers for the multi-tenant app.
 *
 * Order matters: early exits (embeds, webhooks, preflight) run before the
 * Supabase client is built, then API guards, then one host-specific branch.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isStaleRefreshTokenError, signOutStaleSession } from "@/lib/auth/stale-session";
import type { Database } from "@/lib/db/supabase/database.types";
import { handleApiGuards } from "@/lib/routing/proxy-api-guards";
import { handleAppSubdomain } from "@/lib/routing/proxy-app-subdomain";
import { handleAuthSubdomain } from "@/lib/routing/proxy-auth-subdomain";
import type { ProxyContext } from "@/lib/routing/proxy-context";
import { handleCorsPreflight, responseAllowedOrigins } from "@/lib/routing/proxy-cors";
import {
    handleReviewCaptureDomain,
    isReviewCaptureDomain,
} from "@/lib/routing/proxy-review-domains";
import { handleRootDomain } from "@/lib/routing/proxy-root-domain";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hostHeader = request.headers.get("host") || "";
    const hostname = hostHeader.split(":")[0]?.toLowerCase() || "";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

    let supabaseResponse = NextResponse.next({
        request: { headers: request.headers },
    });

    // Public embed widgets: skip auth, subdomain routing, and rate limits.
    if (pathname.startsWith("/w/")) {
        return supabaseResponse;
    }

    // Webhook endpoints must be served immediately and never redirected.
    if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/inngest")) {
        return NextResponse.next({ request: { headers: request.headers } });
    }

    if (request.method === "OPTIONS") {
        return handleCorsPreflight(request, rootDomain);
    }

    const cookieOptions = {
        domain: rootDomain.includes("localhost") ? "localhost" : `.${rootDomain.split(":")[0]}`,
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    };

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            ...cookieOptions,
                        }),
                    );
                },
            },
        },
    );

    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (isStaleRefreshTokenError(authError)) {
        await signOutStaleSession(supabase);
    }

    const ctx: ProxyContext = {
        request,
        pathname,
        hostname,
        hostHeader,
        rootDomain,
        user: authError ? null : authUser,
        supabase,
        response: () => supabaseResponse,
        withSessionCookies: (response) => {
            supabaseResponse.cookies.getAll().forEach((cookie) => {
                response.cookies.set(cookie);
            });
            return response;
        },
        withCorsHeaders: (response) => {
            const origin = request.headers.get("origin") || "";
            if (responseAllowedOrigins(rootDomain).includes(origin)) {
                response.headers.set("Access-Control-Allow-Origin", origin);
                response.headers.set("Access-Control-Allow-Credentials", "true");
            }
            return response;
        },
        withNoIndex: (response) => {
            response.headers.set("X-Robots-Tag", "noindex, nofollow");
            return response;
        },
    };

    if (pathname.startsWith("/api")) {
        const rejection = await handleApiGuards(request, pathname, hostHeader);
        return rejection ?? supabaseResponse;
    }

    if (pathname.includes(".")) {
        return supabaseResponse;
    }

    if (hostname === `auth.${rootDomain}`) {
        return handleAuthSubdomain(ctx);
    }

    if (hostname === `app.${rootDomain}`) {
        return handleAppSubdomain(ctx);
    }

    if (isReviewCaptureDomain(hostname)) {
        return handleReviewCaptureDomain(ctx);
    }

    const apexHost = rootDomain.split(":")[0]?.replace(/^www\./, "") ?? rootDomain;
    const wwwHost = `www.${apexHost}`;

    if (hostname === rootDomain || hostname === wwwHost) {
        return handleRootDomain(ctx, apexHost, wwwHost);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
