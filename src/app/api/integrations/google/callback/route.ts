import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { getAppIntegrationsUrl } from "@/config/env";
import { logger } from "@/lib/logger";
import { exchangeGoogleAuthCode } from "@/app/actions/onboarding/google-oauth-helpers";
import { applyGoogleIntegrationTokens } from "@/services/google/integration-reconnect";
import {
    consumeGoogleIntegrationOAuth, GOOGLE_INTEGRATION_STATE_COOKIE,
    getGoogleIntegrationRedirectUri, googleIntegrationCookieOptions,
} from "@/services/google/integration-oauth-state";

function integrationsRedirect(query: string) {
    const response = NextResponse.redirect(`${getAppIntegrationsUrl()}${query}`);
    response.cookies.set(GOOGLE_INTEGRATION_STATE_COOKIE, "", googleIntegrationCookieOptions(0));
    return response;
}

/**
 * Google returns here after the Integrations (re)connect. The code is exchanged
 * server-side; the signed-in Supabase session is never touched, so a Google
 * account that differs from the owner's login cannot sign them in as it.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    if (searchParams.has("error")) return integrationsRedirect("?google_error=denied");
    const code = searchParams.get("code");
    if (!code || code.length > 4096) return integrationsRedirect("?google_error=missing_params");

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return integrationsRedirect("?google_error=invalid_state");

        const state = await consumeGoogleIntegrationOAuth(
            searchParams.get("state"), request.cookies.get(GOOGLE_INTEGRATION_STATE_COOKIE)?.value, user.id,
        );
        if (!state || !(await canManageBusinessIntegration(supabase, user.id, state.businessId))) {
            return integrationsRedirect("?google_error=invalid_state");
        }

        const tokens = await exchangeGoogleAuthCode(code, getGoogleIntegrationRedirectUri());
        if (!tokens) return integrationsRedirect("?google_error=token_failed");

        const saved = await applyGoogleIntegrationTokens(user.id, state.businessId, tokens);
        if (!saved.ok) return integrationsRedirect(`?google_error=${saved.reason}`);
        return integrationsRedirect(state.purpose === "search_console" ? "?google=search_console" : "?google=connected");
    } catch (err) {
        logger.error({ err }, "[Google connect] OAuth callback failed");
        return integrationsRedirect("?google_error=token_failed");
    }
}
