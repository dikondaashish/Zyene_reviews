import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getAppIntegrationsUrl } from "@/config/env";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import {
    decodeSquareOAuthState,
    exchangeSquareCodeForTokens,
} from "@/services/square/oauth";
import { storeSquareConnection } from "@/services/square/store-connection";

function redirect(query: string) {
    const base = getAppIntegrationsUrl();
    return NextResponse.redirect(`${base}${query.startsWith("?") ? query : `?${query}`}`);
}

/**
 * GET /api/integrations/square/callback
 * Exchanges OAuth code, stores encrypted tokens, redirects to Integrations.
 */
export async function GET(request: Request) {
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

    let state: { businessId: string; userId: string };
    try {
        state = decodeSquareOAuthState(stateParam);
    } catch {
        return redirect("?square_error=invalid_state");
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== state.userId) {
        return redirect("?square_error=auth");
    }
    const allowed = await userCanAccessBusiness(supabase, user.id, state.businessId);
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
        await storeSquareConnection({
            admin,
            businessId: state.businessId,
            merchantId,
            tokens,
        });

        logger.info({ businessId: state.businessId, merchantId }, "[square] OAuth connected");
        return redirect("?square_connected=1");
    } catch (err: unknown) {
        logger.error({ err }, "[square] OAuth callback failed");
        return redirect("?square_error=token_failed");
    }
}
