/**
 * Next.js middleware proxy — handles subdomain routing, auth session refresh,
 * API rate limiting, and CORS headers for the multi-tenant app.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { globalApiRateLimit } from "@/lib/auth/rate-limit";
import {
    getMarketingSiteOrigin,
    isBusinessSlugPath,
    isPlatformRoute,
} from "@/lib/routing/platform-routes";

/** True when the browser Origin matches this request's Host (same deployment / custom review domains like collectratings.com). */
function originMatchesRequestHost(origin: string | null | undefined, hostHeader: string): boolean {
    if (!origin || !hostHeader) return false;
    try {
        const url = new URL(origin);
        const requestHost = hostHeader.split(":")[0]?.toLowerCase() ?? "";
        return url.hostname.toLowerCase() === requestHost;
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const { pathname } = request.nextUrl;
    const hostHeader = request.headers.get("host") || "";
    const hostname = hostHeader.split(":")[0]?.toLowerCase() || "";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    // --- WEBHOOK EXEMPTION ---
    // Ensure all webhook endpoints are served immediately and never redirected.
    if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/inngest")) {
        return NextResponse.next({
            request: { headers: request.headers },
        });
    }

    // --- CORS PREFLIGHT HANDLER ---
    // OPTIONS preflight requests must NEVER be redirected.
    // Return 204 with proper CORS headers for cross-subdomain requests.
    if (request.method === "OPTIONS") {
        const origin = request.headers.get("origin") || "";
        const allowedOrigins = [
            `https://auth.${rootDomain}`,
            `https://app.${rootDomain}`,
            `https://${rootDomain}`,
            `https://www.${rootDomain}`,
        ];

        if (allowedOrigins.includes(origin)) {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                    // Next.js can send multiple internal prefetch/RSC headers across subdomains.
                    // Include all that we may see in preflight requests.
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url, next-router-segment-prefetch",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        return new NextResponse(null, { status: 204 });
    }

    const cookieOptions = {
        domain: rootDomain.includes("localhost") ? "localhost" : `.${rootDomain.split(":")[0]}`,
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    };

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            ...cookieOptions,
                        })
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Helper to add CORS headers to cross-subdomain responses
    const addCorsHeaders = (response: NextResponse) => {
        const origin = request.headers.get("origin") || "";
        const allowedOrigins = [
            `https://auth.${rootDomain}`,
            `https://app.${rootDomain}`,
            `https://${rootDomain}`,
        ];
        if (allowedOrigins.includes(origin)) {
            response.headers.set("Access-Control-Allow-Origin", origin);
            response.headers.set("Access-Control-Allow-Credentials", "true");
        }
        return response;
    };

    const createResponse = (response: NextResponse) => {
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie);
        });
        return response;
    };

    // --- GLOBAL API RATE LIMITING (DDoS Protection) ---
    if (pathname.startsWith("/api")) {
        // Whitelist webhook/background jobs and auth callbacks from global rate limiting.
        // Login flows (OAuth redirect to /api/auth/callback) and immediate post-login API bursts
        // share one IP; counting auth against the global bucket caused false 429s for real users.
        const whitelistedPaths = [
            "/api/webhooks",
            "/api/inngest",
            "/api/cron",
            "/api/auth",
        ];
        const isWhitelisted = whitelistedPaths.some(p => pathname.startsWith(p));

        if (!isWhitelisted) {
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || "anonymous";

            try {
                const { success } = await globalApiRateLimit.limit(ip);
                if (!success) {
                    return NextResponse.json(
                        { error: "Too many requests. Please slow down." },
                        { status: 429 }
                    );
                }
            } catch (e) {
                // If Redis is down, fail open (don't block legitimate traffic)
                console.error("Global rate limit check failed:", e);
            }
        }

        // CSRF Protection: Validate Origin on mutating requests.
        // Developer API (v1) uses X-API-Key / Bearer — Postman and servers often omit Origin; exempt this prefix.
        const csrfWhitelisted = ["/api/webhooks", "/api/inngest", "/api/cron", "/api/v1"];
        const isCsrfWhitelisted = csrfWhitelisted.some(p => pathname.startsWith(p));

        if (!isCsrfWhitelisted) {
            const origin = request.headers.get("origin");
            const allowedOrigins = [
                `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                `https://www.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
            ];

            const csrfAllowed =
                allowedOrigins.includes(origin ?? "") || originMatchesRequestHost(origin, hostHeader);

            if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && !csrfAllowed) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        return supabaseResponse;
    }

    if (pathname.includes(".")) {
        return supabaseResponse;
    }

    // --- AUTH SUBDOMAIN (auth.domain) ---
    if (hostname === `auth.${rootDomain}`) {
        if (user && pathname === "/") {
            const targetUrl = `https://app.${rootDomain}`;

            // RSC client-side navigations use fetch requests.
            // A cross-origin redirect in response to a fetch triggers a CORS error.
            // Detect RSC requests and respond with a full-page redirect via
            // x-middleware-redirect header so the Next.js client router navigates properly.
            const isRSC = request.headers.get("rsc") === "1"
                || request.headers.get("next-router-state-tree")
                || request.nextUrl.searchParams.has("_rsc");

            if (isRSC) {
                const res = new NextResponse(null, {
                    status: 200,
                    headers: {
                        "x-middleware-redirect": targetUrl,
                        "Location": targetUrl,
                    },
                });
                addCorsHeaders(res);
                supabaseResponse.cookies.getAll().forEach((cookie) => {
                    res.cookies.set(cookie);
                });
                return res;
            }

            // Non-RSC navigations are allowed to redirect, but we must still attach
            // CORS headers so the browser doesn't block the redirected fetch.
            const redirectRes = createResponse(
                NextResponse.redirect(new URL(targetUrl, request.url))
            );
            addCorsHeaders(redirectRes);
            return redirectRes;
        }
        // Rewrite root to /login
        if (pathname === "/") {
            return createResponse(
                NextResponse.rewrite(new URL("/login", request.url))
            );
        }
        // Pass other paths (e.g. /signup, /forgot-password)
        return addCorsHeaders(supabaseResponse);
    }

    // --- APP SUBDOMAIN (app.domain) ---
    if (hostname === `app.${rootDomain}`) {
        // Docs should live on apex domain, not app subdomain.
        if (pathname.startsWith("/docs")) {
            return createResponse(
                NextResponse.redirect(new URL(`https://${rootDomain}${pathname}`, request.url))
            );
        }

        // Public review carousel embed — no login; must not redirect to auth (iframes break).
        if (pathname.startsWith("/w/")) {
            return createResponse(supabaseResponse);
        }

        if (!user) {
            // For RSC/fetch requests from auth subdomain, don't redirect (causes CORS error)
            const isRSC = request.headers.get("rsc") === "1"
                || request.headers.get("next-router-state-tree")
                || request.nextUrl.searchParams.has("_rsc");
            const origin = request.headers.get("origin") || "";

            if (isRSC && origin === `https://auth.${rootDomain}`) {
                const res = new NextResponse(
                    JSON.stringify({ redirect: `https://auth.${rootDomain}` }),
                    { status: 401 }
                );
                addCorsHeaders(res);
                return res;
            }

            return createResponse(
                NextResponse.redirect(
                    new URL(`https://auth.${rootDomain}`, request.url)
                )
            );
        }

        try {
            const { data } = await supabase
                .from("users")
                .select("onboarding_completed")
                .eq("id", user.id)
                .single();

            // First-time users must complete onboarding before visiting app pages.
            if (!pathname.startsWith("/onboarding") && data && !data.onboarding_completed) {
                return createResponse(
                    NextResponse.redirect(new URL("/onboarding", request.url))
                );
            }

            // Returning users should never revisit onboarding.
            if (pathname.startsWith("/onboarding") && data?.onboarding_completed) {
                return createResponse(
                    NextResponse.redirect(new URL("/", request.url))
                );
            }
        } catch (error) {
            // If check fails, allow the request to proceed
            console.error("Onboarding status check failed:", error);
        }

        // `/` rewrites to dashboard content; keep `/dashboard` as a first-class URL (no redirect) so
        // client navigations from other app pages avoid an extra round trip and full reload.

        // Rewrite root to /dashboard
        if (pathname === "/") {
            return createResponse(
                NextResponse.rewrite(new URL("/dashboard", request.url))
            );
        }

        // Legacy integrations URLs (pre–marketing /integrations page)
        if (pathname === "/integrations" || pathname.startsWith("/integrations/")) {
            const target = pathname.replace(/^\/integrations/, "/settings/integrations");
            return createResponse(
                NextResponse.redirect(new URL(target, request.url))
            );
        }

        // Pass strictly dashboard paths? Or allow all?
        // For now allow all, but redirect logic handles unauth.
        return supabaseResponse;
    }

    // --- REVIEW CAPTURE DOMAINS ---
    const reviewDomains = [
        "collectratings.com",
        "www.collectratings.com",
        "ratingcollect.com",
        "www.ratingcollect.com"
    ];

    if (reviewDomains.includes(hostname)) {
        // Root has no marketing site — review capture only.
        if (pathname === "/") {
            return new NextResponse("", { status: 404 });
        }

        // Platform/marketing paths belong on zyenereviews.com, not collectratings.com.
        if (isPlatformRoute(pathname)) {
            const marketingOrigin = getMarketingSiteOrigin(rootDomain);
            const target = new URL(pathname, marketingOrigin);
            target.search = request.nextUrl.search;
            return createResponse(NextResponse.redirect(target, 301));
        }

        // Only single-segment business slugs rewrite to /r/[slug].
        if (!isBusinessSlugPath(pathname)) {
            const marketingOrigin = getMarketingSiteOrigin(rootDomain);
            const target = new URL(pathname, marketingOrigin);
            target.search = request.nextUrl.search;
            return createResponse(NextResponse.redirect(target, 301));
        }

        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = `/r${pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}`;
        return createResponse(NextResponse.rewrite(rewriteUrl));
    }

    // --- ROOT DOMAIN (domain) ---
    if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
        // Localhost Dev Support: Handle routing via paths since subdomains are problematic locally
        if (rootDomain.includes("localhost")) {
            // Allow public review requests route
            if (pathname.startsWith("/r/")) {
                return supabaseResponse;
            }

            // Allow onboarding path only for first-time users.
            if (pathname.startsWith("/onboarding")) {
                if (!user) {
                    return createResponse(NextResponse.redirect(new URL("/login", request.url)));
                }

                try {
                    const { data } = await supabase
                        .from("users")
                        .select("onboarding_completed")
                        .eq("id", user.id)
                        .single();

                    if (data?.onboarding_completed) {
                        return createResponse(NextResponse.redirect(new URL("/dashboard", request.url)));
                    }
                } catch (error) {
                    console.error("Onboarding status check failed:", error);
                }

                return supabaseResponse;
            }

            // If accessing /dashboard and not logged in -> redirect /login
            if (pathname.startsWith("/dashboard") && !user) {
                return createResponse(NextResponse.redirect(new URL("/login", request.url)));
            }

            // Check onboarding status for dashboard access
            if (pathname.startsWith("/dashboard") && user) {
                try {
                    const { data } = await supabase
                        .from("users")
                        .select("onboarding_completed")
                        .eq("id", user.id)
                        .single();

                    if (data && !data.onboarding_completed) {
                        return createResponse(
                            NextResponse.redirect(new URL("/onboarding", request.url))
                        );
                    }
                } catch (error) {
                    // If check fails, allow the request to proceed
                    console.error("Onboarding status check failed:", error);
                }
            }

            // If accessing /login and logged in -> redirect /dashboard
            if ((pathname === "/login" || pathname === "/") && user) {
                return createResponse(NextResponse.redirect(new URL("/dashboard", request.url)));
            }
            return supabaseResponse;
        }

        // Production Root Domain Logic

        // 1. Landing page -> pass
        if (pathname === "/") return supabaseResponse;

        // 2. Platform + marketing routes stay on zyenereviews.com (never → collectratings).
        const isReserved = isPlatformRoute(pathname);

        // 3. Single-segment business slugs → collectratings.com (canonical review URLs).
        if (!isReserved && isBusinessSlugPath(pathname)) {
            const targetUrl = request.nextUrl.clone();
            targetUrl.protocol = "https";
            targetUrl.hostname = "www.collectratings.com";
            targetUrl.port = "";
            return createResponse(NextResponse.redirect(targetUrl, 301));
        }

        return supabaseResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
