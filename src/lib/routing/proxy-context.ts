import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/db/supabase/database.types";

/**
 * Shared state threaded through the proxy's host-specific branches.
 *
 * `response()` is a getter rather than a value because Supabase reassigns the
 * session-carrying response from inside its `setAll` cookie callback — a
 * snapshot taken before that runs would drop refreshed auth cookies.
 */
export interface ProxyContext {
    request: NextRequest;
    pathname: string;
    /** Host header with any port stripped, lowercased. */
    hostname: string;
    /** Raw Host header, port included. */
    hostHeader: string;
    rootDomain: string;
    user: User | null;
    supabase: SupabaseClient<Database>;
    response: () => NextResponse;
    /** Copies the session cookies from the current response onto `response`. */
    withSessionCookies: (response: NextResponse) => NextResponse;
    withCorsHeaders: (response: NextResponse) => NextResponse;
    withNoIndex: (response: NextResponse) => NextResponse;
}

/**
 * RSC client-side navigations arrive as fetch requests. Cross-origin redirects
 * in response to those trigger CORS errors, so they need different handling.
 */
export function isRscRequest(request: NextRequest): boolean {
    return (
        request.headers.get("rsc") === "1" ||
        Boolean(request.headers.get("next-router-state-tree")) ||
        request.nextUrl.searchParams.has("_rsc")
    );
}

/** Reads the user's onboarding flag. Throws if the query fails — callers decide. */
export async function readOnboardingRow(ctx: ProxyContext, userId: string) {
    const { data } = await ctx.supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", userId)
        .single();
    return data;
}
