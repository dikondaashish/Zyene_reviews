"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { consumeGoogleConnectData, saveGoogleConnectData } from "@/services/google/connect-session";
import { consumeGoogleOnboardingOAuth } from "@/services/google/onboarding-oauth-state";
import { z } from "zod";

import { finalizeVerifiedGoogleConnection } from "@/app/actions/onboarding/google-connection-finalize";
import {
    exchangeGoogleAuthCode,
    listGoogleBusinessLocations,
    mapLocationsForSelection,
} from "./google-oauth-helpers";

const businessSchema = z.string().uuid();

/**
 * Exchanges the OAuth code, then either hands back the location list for the
 * user to pick from (more than one) or finalizes the connection outright (exactly one).
 */
export async function initializeGoogleAuth(
    authCode: string,
    businessId: string,
    _clientRedirectUri?: string,
    state?: string,
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "You are not authenticated." };
        }
        if (!businessSchema.safeParse(businessId).success || !authCode.trim() || authCode.length > 4096 ||
            !(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return { success: false, error: "Permission denied." };
        }

        if (!state) return { success: false, error: "Missing Google connection state. Please reconnect." };
        const pending = await consumeGoogleOnboardingOAuth(state, user.id, businessId);
        if (!pending) return { success: false, error: "Invalid or expired Google connection. Please reconnect." };
        const redirectUri = pending.redirectUri;
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
                    connectionId: await saveGoogleConnectData({ userId: user.id, businessId, tokens, locations: allLocations }),
                };
            }

            if (allLocations.length === 1) {
                return await finalizeVerifiedGoogleConnection(businessId, allLocations[0], tokens);
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

/** The browser supplies an opaque handle and a name, never provider tokens. */
export async function finalizeGoogleConnection(businessId: string, locationName: string, connectionId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !businessSchema.safeParse(businessId).success ||
            !(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return { success: false, error: "Permission denied." };
        }
        const data = await consumeGoogleConnectData(connectionId, user.id, businessId, locationName);
        if (!data) return { success: false, error: "Connection expired or invalid. Please reconnect." };
        return finalizeVerifiedGoogleConnection(businessId, data.location, data.tokens);
    } catch {
        return { success: false, error: "Unable to finalize connection. Please reconnect." };
    }
}
