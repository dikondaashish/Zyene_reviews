import { logger } from "@/lib/logger";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getAppIntegrationsUrl } from "@/config/env";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { exchangeSquareCodeForTokens } from "@/services/square/oauth";
import { getSquareApplicationSecret } from "@/services/square/config";
import {
    posOAuthCookieOptions, posOAuthStateCookieName, verifyPosOAuthState,
} from "@/lib/auth/pos-oauth-state";
import { storeSquareConnection } from "@/services/square/store-connection";

function redirect(query: string) {
    const base = getAppIntegrationsUrl();
    const response = NextResponse.redirect(`${base}${query.startsWith("?") ? query : `?${query}`}`);
    // One-shot state: clear it whatever the outcome, so a callback URL cannot be replayed.
    response.cookies.set(posOAuthStateCookieName("square"), "", posOAuthCookieOptions("square", 0));
    return response;
}

/**
 * GET /api/integrations/square/callback
 * Exchanges OAuth code, stores encrypted tokens, redirects to Integrations.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        logger.warn({ error }, "[square] OAuth denied");
        return redirect("?square_error=denied");
    }
    if (!code || !stateParam) {
        return redirect("?square_error=missing_params");
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect("?square_error=auth");
    }

    // The state must match the signed cookie set by /connect in this browser for this user.
    const state = verifyPosOAuthState(
        "square", stateParam, request.cookies.get(posOAuthStateCookieName("square"))?.value,
        user.id, getSquareApplicationSecret() ?? "",
    );
    if (!state) {
        return redirect("?square_error=invalid_state");
    }
    const allowed = await canManageBusinessIntegration(supabase, user.id, state.businessId);
    if (!allowed) {
        return redirect("?square_error=forbidden");
    }

    try {
        const tokens = await exchangeSquareCodeForTokens(code);
        const merchantId = tokens.merchant_id;
        if (!merchantId) {
            return redirect("?square_error=no_merchant");
        }

        const admin = createAdminClient();
        try {
            await storeSquareConnection({
                admin,
                businessId: state.businessId,
                merchantId,
                tokens,
            });
        } catch (storeErr: unknown) {
            logger.error({ err: storeErr, businessId: state.businessId, merchantId }, "[square] OAuth store failed");
            return redirect("?square_error=store_failed");
        }

        logger.info({ businessId: state.businessId, merchantId }, "[square] OAuth connected");
        return redirect("?square_connected=1");
    } catch (err: unknown) {
        logger.error({ err }, "[square] OAuth token exchange failed");
        return redirect("?square_error=token_failed");
    }
}
