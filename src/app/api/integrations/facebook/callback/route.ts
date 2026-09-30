import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { getAppIntegrationsUrl } from "@/config/env";
import { getAppSecret } from "@/services/facebook/client";
import { completeFacebookOAuth } from "@/services/facebook/complete-oauth";
import { FB_CONNECT_COOKIE } from "@/services/facebook/connect-session";
import {
    FACEBOOK_STATE_COOKIE, facebookCookieOptions, verifyFacebookOAuthState,
} from "@/services/facebook/oauth-state";

function integrationsRedirect(query: string) {
    return NextResponse.redirect(`${getAppIntegrationsUrl()}${query}`);
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    if (searchParams.has("error")) return integrationsRedirect("?fb_error=denied");

    const code = searchParams.get("code");
    const nonce = searchParams.get("state");
    if (!code || !nonce) return integrationsRedirect("?fb_error=missing_params");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return integrationsRedirect("?fb_error=invalid_state");

    const state = verifyFacebookOAuthState(
        nonce, request.cookies.get(FACEBOOK_STATE_COOKIE)?.value, user.id, getAppSecret(),
    );
    if (!state || !(await canManageBusinessIntegration(supabase, user.id, state.businessId))) {
        return integrationsRedirect("?fb_error=invalid_state");
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const redirectUri = `${rootDomain}/api/integrations/facebook/callback`;

    try {
        const selectionNonce = await completeFacebookOAuth(
            code, redirectUri, user.id, state.businessId,
        );
        const response = integrationsRedirect(selectionNonce ? "?fb_select_page=true" : "?fb_error=no_pages");
        response.cookies.set(FACEBOOK_STATE_COOKIE, "",
            facebookCookieOptions("/api/integrations/facebook/callback", 0));
        if (selectionNonce) {
            response.cookies.set(FB_CONNECT_COOKIE, selectionNonce,
                facebookCookieOptions("/api/integrations/facebook", 300));
        }
        return response;
    } catch {
        return integrationsRedirect("?fb_error=token_failed");
    }
}
