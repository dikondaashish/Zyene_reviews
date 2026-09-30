"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { beginGoogleOnboardingOAuth } from "@/services/google/onboarding-oauth-state";
import { GBP_SCOPE } from "@/services/google/oauth-scopes";
import { resolveGoogleOAuthRedirectUri } from "@/app/actions/onboarding/google-oauth-helpers";

export async function prepareGoogleOnboardingOAuth(businessId: string, clientRedirectUri: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !z.string().uuid().safeParse(businessId).success ||
            !(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return { success: false as const, error: "Permission denied." };
        }
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
        if (!clientId) return { success: false as const, error: "Google connection unavailable." };
        const redirectUri = await resolveGoogleOAuthRedirectUri(clientRedirectUri);
        const nonce = await beginGoogleOnboardingOAuth({ userId: user.id, businessId, redirectUri });
        const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri,
            response_type: "code", scope: GBP_SCOPE, access_type: "offline", prompt: "consent", state: nonce }).toString();
        return { success: true as const, url: url.toString() };
    } catch {
        return { success: false as const, error: "Unable to start Google connection." };
    }
}
