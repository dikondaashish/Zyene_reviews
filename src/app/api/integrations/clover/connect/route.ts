import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { buildCloverAuthorizeUrl } from "@/services/clover/oauth";
import { isCloverConfigured, getCloverAppSecret } from "@/services/clover/config";
import { z } from "zod";
import {
    createPosOAuthState, POS_OAUTH_STATE_MAX_AGE_S, posOAuthCookieOptions, posOAuthStateCookieName,
} from "@/lib/auth/pos-oauth-state";

/**
 * GET /api/integrations/clover/connect?businessId=
 * Starts Clover OAuth (sandbox or production per CLOVER_ENV).
 */
export async function GET(request: Request) {
    if (!isCloverConfigured()) {
        return NextResponse.json(
            { error: "Clover is not configured. Set CLOVER_APP_ID and CLOVER_APP_SECRET." },
            { status: 503 },
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const parsedBusinessId = z.uuid().safeParse(new URL(request.url).searchParams.get("businessId"));
    if (!parsedBusinessId.success) {
        return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }
    const businessId = parsedBusinessId.data;

    const allowed = await canManageBusinessIntegration(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Bind this attempt to the signed-in user and business; the callback must present the cookie.
    const state = createPosOAuthState("clover", user.id, businessId, getCloverAppSecret() ?? "");
    const response = NextResponse.redirect(buildCloverAuthorizeUrl(state.nonce));
    response.cookies.set(posOAuthStateCookieName("clover"), state.cookieValue,
        posOAuthCookieOptions("clover", POS_OAUTH_STATE_MAX_AGE_S));
    return response;
}
