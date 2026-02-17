import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppId } from "@/lib/facebook/client";

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
    const businessId = searchParams.get("businessId");

    if (!businessId) {
        return NextResponse.json(
            { error: "businessId is required" },
            { status: 400 }
        );
    }

    const appId = getAppId();
    const rootDomain =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const redirectUri = `${rootDomain}/api/integrations/facebook/callback`;

    // State encodes businessId so we can associate on callback
    const state = Buffer.from(
        JSON.stringify({ businessId, userId: user.id })
    ).toString("base64url");

    const scopes = [
        "pages_read_engagement",
        "pages_manage_metadata",
        "pages_read_user_content",
    ].join(",");

    const oauthUrl =
        `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scopes}` +
        `&state=${state}` +
        `&response_type=code`;

    return NextResponse.redirect(oauthUrl);
}
