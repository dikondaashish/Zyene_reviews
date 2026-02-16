"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const cookieDomain = rootDomain.includes("localhost") ? "localhost" : `.${rootDomain}`;

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                domain: cookieDomain,
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            }
        }
    );
}
