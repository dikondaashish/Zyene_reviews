import { NextResponse } from "next/server";
import { z } from "zod";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { createClient } from "@/lib/db/supabase/server";
import { getAppIntegrationsUrl } from "@/config/env";
import { logger } from "@/lib/logger";
import { GBP_SCOPE, SEARCH_CONSOLE_SCOPE } from "@/services/google/oauth-scopes";
import {
    beginGoogleIntegrationOAuth, GOOGLE_INTEGRATION_STATE_COOKIE, GOOGLE_INTEGRATION_STATE_TTL_SECONDS,
    getGoogleIntegrationRedirectUri, googleIntegrationCookieOptions,
} from "@/services/google/integration-oauth-state";

const querySchema = z.object({
    businessId: z.string().uuid(),
    purpose: z.enum(["connect", "search_console"]).default("connect"),
});

/**
 * GET: sends the signed-in owner to Google consent for one business.
 * Server-side OAuth (no Supabase `signInWithOAuth`), so the app session is never replaced.
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.redirect(new URL("/login", request.url));

        const { searchParams } = new URL(request.url);
        const parsed = querySchema.safeParse({
            businessId: searchParams.get("businessId"),
            purpose: searchParams.get("purpose") ?? undefined,
        });
        if (!parsed.success) return NextResponse.json({ error: "businessId is required" }, { status: 400 });
        const { businessId, purpose } = parsed.data;

        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
        if (!clientId) return NextResponse.redirect(`${getAppIntegrationsUrl()}?google_error=unavailable`);

        const nonce = await beginGoogleIntegrationOAuth({ userId: user.id, businessId, purpose });
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: getGoogleIntegrationRedirectUri(),
            response_type: "code",
            // Search Console is incremental consent on top of the existing GBP grant.
            scope: purpose === "search_console" ? `${GBP_SCOPE} ${SEARCH_CONSOLE_SCOPE}` : GBP_SCOPE,
            access_type: "offline",
            prompt: "consent",
            state: nonce,
            ...(purpose === "search_console" ? { include_granted_scopes: "true" } : {}),
        });
        const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
        response.cookies.set(GOOGLE_INTEGRATION_STATE_COOKIE, nonce,
            googleIntegrationCookieOptions(GOOGLE_INTEGRATION_STATE_TTL_SECONDS));
        return response;
    } catch (err) {
        logger.error({ err }, "[Google connect] Failed to start OAuth");
        return NextResponse.redirect(`${getAppIntegrationsUrl()}?google_error=start_failed`);
    }
}
