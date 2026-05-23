import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { getAppIntegrationsUrl } from "@/config/env";
import { exchangeCodeForToken, getLongLivedToken } from "@/services/facebook/client";
import { getPages } from "@/services/facebook/adapter";

function integrationsRedirect(query: string) {
    const base = getAppIntegrationsUrl();
    return NextResponse.redirect(`${base}${query.startsWith("?") ? query : `?${query}`}`);
}

/**
 * GET: Facebook OAuth callback.
 * Exchanges code for token, fetches user's pages, redirects to integrations page
 * with page selection data stored in a temporary cookie.
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth denial
    if (error) {
        logger.error({ err: error }, "[Facebook Callback] OAuth error:");
        return integrationsRedirect("?fb_error=denied");
    }

    if (!code || !stateParam) {
        return integrationsRedirect("?fb_error=missing_params");
    }

    // Decode state
    let state: { businessId: string; userId: string };
    try {
        state = JSON.parse(
            Buffer.from(stateParam, "base64url").toString("utf-8")
        );
    } catch {
        return integrationsRedirect("?fb_error=invalid_state");
    }

    const rootDomain =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const redirectUri = `${rootDomain}/api/integrations/facebook/callback`;

    try {
        // 1. Exchange code for short-lived token
        const shortLived = await exchangeCodeForToken(code, redirectUri);

        // 2. Exchange for long-lived token (~60 days)
        const longLived = await getLongLivedToken(shortLived.access_token);

        // 3. Fetch pages the user manages
        const pages = await getPages(longLived.access_token);

        if (pages.length === 0) {
            return NextResponse.redirect(
                new URL("/integrations?fb_error=no_pages", request.url)
            );
        }

        // 4. Store pages + token data in a cookie for the frontend to read
        const fbData = {
            businessId: state.businessId,
            userAccessToken: longLived.access_token,
            tokenExpiresIn: longLived.expires_in,
            pages: pages.map((p) => ({
                pageId: p.pageId,
                pageName: p.pageName,
                pageAccessToken: p.pageAccessToken,
                category: p.category,
            })),
        };

        const response = integrationsRedirect("?fb_select_page=true");

        // Set cookie with page data (encrypted in production, HttpOnly)
        response.cookies.set("fb_connect_data", JSON.stringify(fbData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 300, // 5 minutes — short-lived
            path: "/",
        });

        return response;
    } catch (err: unknown) {
        logger.error({ err: err }, "[Facebook Callback] Token exchange failed:");
        return integrationsRedirect("?fb_error=token_failed");
    }
}
