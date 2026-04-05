import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Global Next.js middleware:
 * 1. Refreshes Supabase auth session on every protected request.
 * 2. Redirects unauthenticated users away from /dashboard/* to /login.
 * 3. Passes through API/auth/_next/static routes.
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const { pathname } = request.nextUrl;

    const isApiRoute = pathname.startsWith("/api/");
    const isAuthRoute = pathname.startsWith("/auth/");
    const isNextRoute = pathname.startsWith("/_next/");
    const isHealthRoute = pathname === "/api/health";
    const isStaticFile = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf|eot)$/.test(pathname);

    if (isApiRoute || isAuthRoute || isNextRoute || isHealthRoute || isStaticFile) {
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

    if (!user && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/:path*"],
};
