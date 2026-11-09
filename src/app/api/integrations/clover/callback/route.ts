import { logger } from "@/lib/logger";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getAppIntegrationsUrl } from "@/config/env";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { exchangeCloverCodeForTokens } from "@/services/clover/oauth";
import { getCloverAppSecret } from "@/services/clover/config";
import {
    posOAuthCookieOptions, posOAuthStateCookieName, verifyPosOAuthState,
} from "@/lib/auth/pos-oauth-state";
import { storeCloverConnection } from "@/services/clover/store-connection";

function redirect(query: string) {
    const base = getAppIntegrationsUrl();
    const response = NextResponse.redirect(`${base}${query.startsWith("?") ? query : `?${query}`}`);
    // One-shot state: clear it whatever the outcome, so a callback URL cannot be replayed.
    response.cookies.set(posOAuthStateCookieName("clover"), "", posOAuthCookieOptions("clover", 0));
    return response;
}

/**
 * GET /api/integrations/clover/callback
 * Exchanges OAuth code, stores encrypted tokens, redirects to Integrations.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");
    const merchantIdParam = searchParams.get("merchant_id");

    if (error) {
        logger.warn({ error }, "[clover] OAuth denied");
        return redirect("?clover_error=denied");
    }
    if (!code || !stateParam) {
        return redirect("?clover_error=missing_params");
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect("?clover_error=auth");
    }

    // The state must match the signed cookie set by /connect in this browser for this user.
    const state = verifyPosOAuthState(
        "clover", stateParam, request.cookies.get(posOAuthStateCookieName("clover"))?.value,
        user.id, getCloverAppSecret() ?? "",
    );
    if (!state) {
        return redirect("?clover_error=invalid_state");
    }
    const allowed = await canManageBusinessIntegration(supabase, user.id, state.businessId);
    if (!allowed) {
        return redirect("?clover_error=forbidden");
    }

    try {
        const tokens = await exchangeCloverCodeForTokens(code);
        const merchantId = tokens.merchant_id || merchantIdParam;
        if (!merchantId) {
            return redirect("?clover_error=no_merchant");
        }

        const admin = createAdminClient();
        await storeCloverConnection({
            admin,
            businessId: state.businessId,
            merchantId,
            tokens,
        });

        logger.info(
            { businessId: state.businessId, merchantId },
            "[clover] OAuth connected",
        );
        return redirect("?clover_connected=1");
    } catch (err: unknown) {
        logger.error({ err }, "[clover] OAuth callback failed");
        return redirect("?clover_error=token_failed");
    }
}
