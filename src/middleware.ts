import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Global Next.js middleware:
 * 1. Refreshes Supabase auth session on every request (prevents stale cookies)
 * 2. Redirects unauthenticated users away from protected /dashboard routes
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

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

    // Refresh the session — this must happen before any auth check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Protect dashboard routes — redirect to login if unauthenticated
    if (!user && pathname.startsWith("/dashboard")) {
        const rootDomain =
            process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const loginUrl = rootDomain.includes("localhost")
            ? new URL("/login", request.url)
            : new URL(`https://auth.${rootDomain}`);
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - public folder assets
         * - API routes (they handle their own auth)
         * - monitoring (Sentry tunnel)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/|monitoring).*)",
    ],
};
