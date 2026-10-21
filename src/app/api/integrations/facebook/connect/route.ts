import { NextResponse } from "next/server";
import { z } from "zod";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { createClient } from "@/lib/db/supabase/server";
import { getAppIntegrationsUrl } from "@/config/env";
import { getAppId, getAppSecret } from "@/services/facebook/client";
import { createFacebookOAuthState, FACEBOOK_STATE_COOKIE, facebookCookieOptions } from
    "@/services/facebook/oauth-state";

const connectQuerySchema = z.object({ businessId: z.string().uuid() });

// `pages_show_list` is required for /me/accounts to return the user's Pages.
const FACEBOOK_SCOPES = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "pages_read_user_content",
].join(",");

/**
 * GET: Redirects user to Facebook OAuth login.
 * Expects ?businessId= in the query string (stored in state for the callback).
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const parsed = connectQuerySchema.safeParse({ businessId: searchParams.get("businessId") });
    if (!parsed.success) {
        return NextResponse.json(
            { error: "businessId is required" },
            { status: 400 }
        );
    }
    const { businessId } = parsed.data;

    if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
        return NextResponse.redirect(`${getAppIntegrationsUrl()}?fb_error=unavailable`);
    }

    const appId = getAppId();
    const rootDomain =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const redirectUri = `${rootDomain}/api/integrations/facebook/callback`;

    const state = createFacebookOAuthState(user.id, businessId, getAppSecret());

    // Facebook Login for Business apps pick permissions via a dashboard configuration;
    // classic apps send them as `scope`.
    const configId = process.env.FACEBOOK_LOGIN_CONFIG_ID;
    const permissions = configId
        ? `&config_id=${encodeURIComponent(configId)}`
        : `&scope=${FACEBOOK_SCOPES}`;

    const oauthUrl =
        `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        permissions +
        `&state=${state.nonce}` +
        `&response_type=code`;

    const response = NextResponse.redirect(oauthUrl);
    response.cookies.set(FACEBOOK_STATE_COOKIE, state.cookieValue,
        facebookCookieOptions("/api/integrations/facebook/callback", 600));
    return response;
}
