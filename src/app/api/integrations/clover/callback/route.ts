import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getAppIntegrationsUrl } from "@/config/env";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import {
    decodeCloverOAuthState,
    exchangeCloverCodeForTokens,
} from "@/services/clover/oauth";
import { storeCloverConnection } from "@/services/clover/store-connection";

function redirect(query: string) {
    const base = getAppIntegrationsUrl();
    return NextResponse.redirect(`${base}${query.startsWith("?") ? query : `?${query}`}`);
}

/**
 * GET /api/integrations/clover/callback
 * Exchanges OAuth code, stores encrypted tokens, redirects to Integrations.
 */
export async function GET(request: Request) {
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

    let state: { businessId: string; userId: string };
    try {
        state = decodeCloverOAuthState(stateParam);
    } catch {
        return redirect("?clover_error=invalid_state");
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== state.userId) {
        return redirect("?clover_error=auth");
    }
    const allowed = await userCanAccessBusiness(supabase, user.id, state.businessId);
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
