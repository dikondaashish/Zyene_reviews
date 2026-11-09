import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { buildSquareAuthorizeUrl } from "@/services/square/oauth";
import { isSquareConfigured, getSquareApplicationSecret } from "@/services/square/config";
import { z } from "zod";
import {
    createPosOAuthState, POS_OAUTH_STATE_MAX_AGE_S, posOAuthCookieOptions, posOAuthStateCookieName,
} from "@/lib/auth/pos-oauth-state";

/**
 * GET /api/integrations/square/connect?businessId=
 * Starts Square OAuth (sandbox or production per SQUARE_ENV).
 */
export async function GET(request: Request) {
    if (!isSquareConfigured()) {
        return NextResponse.json(
            {
                error: "Square is not configured. Set SQUARE_APPLICATION_ID and SQUARE_APPLICATION_SECRET.",
            },
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
    const state = createPosOAuthState("square", user.id, businessId, getSquareApplicationSecret() ?? "");
    const response = NextResponse.redirect(buildSquareAuthorizeUrl(state.nonce));
    response.cookies.set(posOAuthStateCookieName("square"), state.cookieValue,
        posOAuthCookieOptions("square", POS_OAUTH_STATE_MAX_AGE_S));
    return response;
}
