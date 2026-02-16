import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
    const { pathname, search } = request.nextUrl;

    const createResponse = (response: NextResponse) => {
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie);
        });
        return response;
    };

    if (pathname.startsWith("/api")) {
        return supabaseResponse;
    }

    if (pathname.includes(".")) {
        return supabaseResponse;
    }

    // --- LOGIN SUBDOMAIN (login.domain) ---
    if (hostname === `login.${rootDomain}`) {
        if (user && pathname === "/") {
            return createResponse(
                NextResponse.redirect(
                    new URL(`http://dashboard.${rootDomain}`, request.url)
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

    // --- DASHBOARD SUBDOMAIN (dashboard.domain) ---
    if (hostname === `dashboard.${rootDomain}`) {
        if (!user) {
            return createResponse(
                NextResponse.redirect(
                    new URL(`http://login.${rootDomain}`, request.url)
                )
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
    if (hostname === rootDomain) {
        // Localhost Dev Support: Handle routing via paths since subdomains are problematic locally
        if (rootDomain.includes("localhost")) {
            // If accessing /dashboard and not logged in -> redirect /login
            if (pathname.startsWith("/dashboard") && !user) {
                return createResponse(NextResponse.redirect(new URL("/login", request.url)));
            }
            // If accessing /login and logged in -> redirect /dashboard
            if ((pathname === "/login" || pathname === "/") && user) {
                return createResponse(NextResponse.redirect(new URL("/dashboard", request.url)));
            }
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
