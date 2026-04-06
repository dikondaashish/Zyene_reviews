import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Global Next.js middleware:
 * 1. Refreshes Supabase auth session on every protected request.
 * 2. Subdomain routing: app.* → dashboard, auth.* → auth routes.
 * 3. Redirects unauthenticated users away from /dashboard/* to login.
 * 4. Passes through API/auth/_next/static routes.
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const { pathname } = request.nextUrl;
    const hostname = request.headers.get("host") || "";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

    // Extract subdomain (e.g. "app" from "app.zyenereviews.com")
    const subdomain = hostname.replace(`.${rootDomain}`, "").replace(`:${rootDomain.split(":")[1] || ""}`, "");
    const isAppSubdomain = subdomain === "app";
    const isAuthSubdomain = subdomain === "auth";

    const isApiRoute = pathname.startsWith("/api/");
    const isAuthRoute = pathname.startsWith("/auth/");
    const isNextRoute = pathname.startsWith("/_next/");
    const isHealthRoute = pathname === "/api/health";
    
    // Explicitly bypass manifest and other common root assets
    const isPublicRootAsset = /^\/(?:manifest\.json|manifest\.webmanifest|favicon\.ico|robots\.txt|sitemap\.xml)$/.test(pathname);
    
    // Check for other common static file extensions
    const isStaticFile = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf|eot|json)$/.test(pathname);

    if (isApiRoute || isAuthRoute || isNextRoute || isHealthRoute || isStaticFile || isPublicRootAsset) {
        return supabaseResponse;
    }

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
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session before auth checks.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const protocol = rootDomain.includes("localhost") ? "http" : "https";

    // App subdomain: require auth and redirect root to /dashboard
    if (isAppSubdomain) {
        if (!user) {
            return NextResponse.redirect(`${protocol}://auth.${rootDomain}/login`);
        }
        if (pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Auth subdomain: redirect authenticated users to app
    if (isAuthSubdomain && user) {
        if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
            return NextResponse.redirect(`${protocol}://app.${rootDomain}/dashboard`);
        }
    }

    // Fallback: protect /dashboard/* routes
    if (!user && pathname.startsWith("/dashboard")) {
        if (rootDomain.includes("localhost")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.redirect(`${protocol}://auth.${rootDomain}/login`);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/:path*"],
};
