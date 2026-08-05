"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";

import { finalizeGoogleConnection } from "./google-connection-finalize";
import {
    exchangeGoogleAuthCode,
    listGoogleBusinessLocations,
    mapLocationsForSelection,
    resolveGoogleOAuthRedirectUri,
} from "./google-oauth-helpers";

/**
 * Exchanges the OAuth code, then either hands back the location list for the
 * user to pick from (more than one) or finalizes the connection outright (exactly one).
 */
export async function initializeGoogleAuth(
    authCode: string,
    businessId: string,
    clientRedirectUri?: string,
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "You are not authenticated." };
        }

        const redirectUri = await resolveGoogleOAuthRedirectUri(clientRedirectUri);
        const tokens = await exchangeGoogleAuthCode(authCode, redirectUri);

        if (!tokens) {
            return { success: false, error: "Failed to authenticate with Google." };
        }

        if (!tokens.refreshToken) {
            logger.warn(
                { businessId, redirectUri },
                "[Onboarding] Google token exchange returned no refresh_token (sync will fail until reconnect)",
            );
        }

        try {
            const allLocations = await listGoogleBusinessLocations(tokens.accessToken);

            if (allLocations.length > 1) {
                return {
                    success: true,
                    multipleLocations: true,
                    locations: mapLocationsForSelection(allLocations),
                    tokens,
                };
            }

            if (allLocations.length === 1) {
                return await finalizeGoogleConnection(businessId, allLocations[0], tokens);
            }

            return {
                success: false,
                error: "No Google Business locations found for this account.",
            };
        } catch (apiError) {
            logger.error({ err: apiError }, "Error fetching Google Business Profile data");
            return {
                success: false,
                error: "Failed to fetch your Google Business details. You can continue manually.",
            };
        }
    } catch (error: unknown) {
        logger.error({ err: error }, "Unexpected error in initializeGoogleAuth");
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}
