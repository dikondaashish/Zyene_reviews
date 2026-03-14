import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { globalApiRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

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

    const hostname = request.headers.get("host")!;
    const { pathname } = request.nextUrl;

    const createResponse = (response: NextResponse) => {
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie);
        });
        return response;
    };

    // --- GLOBAL API RATE LIMITING (DDoS Protection) ---
    if (pathname.startsWith("/api")) {
        // Whitelist webhook and background job endpoints from global rate limiting
        const whitelistedPaths = ["/api/webhooks", "/api/inngest", "/api/cron"];
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

        // CSRF Protection: Validate Origin on mutating requests
        const csrfWhitelisted = ["/api/webhooks", "/api/inngest", "/api/cron"];
        const isCsrfWhitelisted = csrfWhitelisted.some(p => pathname.startsWith(p));

        if (!isCsrfWhitelisted) {
            const origin = request.headers.get("origin");
            const allowedOrigins = [
                `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
            ];

            if (
                ["POST", "PUT", "DELETE", "PATCH"].includes(request.method) &&
                !allowedOrigins.includes(origin ?? "")
            ) {
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
            return createResponse(
                NextResponse.redirect(
                    new URL(`https://app.${rootDomain}`, request.url)
                )
            );
        }
        // Rewrite root to /login
        if (pathname === "/") {
            return createResponse(
                NextResponse.rewrite(new URL("/login", request.url))
            );
        }
        // Pass other paths (e.g. /signup, /forgot-password)
        return supabaseResponse;
    }

    // --- APP SUBDOMAIN (app.domain) ---
    if (hostname === `app.${rootDomain}`) {
        if (!user) {
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

        // Redirect /dashboard to / for clean URL
        if (pathname === "/dashboard") {
            return createResponse(
                NextResponse.redirect(new URL("/", request.url))
            );
        }

        // Rewrite root to /dashboard
        if (pathname === "/") {
            return createResponse(
                NextResponse.rewrite(new URL("/dashboard", request.url))
            );
        }

        // Pass strictly dashboard paths? Or allow all?
        // For now allow all, but redirect logic handles unauth.
        return supabaseResponse;
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

        // 2. Reserved prefixes that should NOT be rewritten
        const reservedPrefixes = [
            "/api",
            "/_next",
            "/static",
            "/favicon.ico",
            "/login",
            "/signup",
            "/forgot-password",
            "/privacy",
            "/terms",
            "/data-retention",
            "/help",
            "/about",
            "/contact",
            "/r/", // Keep legacy paths working
            "/w/", // Embeddable widgets
        ];

        const isReserved = reservedPrefixes.some(prefix => pathname.startsWith(prefix));

        // 3. Rewrite business slugs to /r/[slug]
        if (!isReserved && !pathname.includes(".")) {
            console.log(`[Middleware] Rewriting ${hostname}${pathname} to /r${pathname}`);
            return createResponse(
                NextResponse.rewrite(new URL(`/r${pathname}`, request.url))
            );
        }

        console.log(`[Middleware] Passing ${hostname}${pathname} (No rewrite)`);
        return supabaseResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
