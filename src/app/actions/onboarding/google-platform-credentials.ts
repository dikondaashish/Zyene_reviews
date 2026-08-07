import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

interface StoreCredentialsParams {
    businessId: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    googleAccountId: string | null;
    googleLocationId: string | null;
    googleReviewUrl: string | null;
    reviewCount: number;
    averageRating: number;
    /** Verbatim from the token response. Undefined stays NULL — unknown, not "none". */
    grantedScopes?: string;
}

type StoreCredentialsResult =
    | { ok: true; platformId: string | null }
    | { ok: false; error: string };

/**
 * Encrypts the Google tokens via the `encrypt_token` RPC and upserts the
 * review_platforms row. An absent refresh token falls back to the one already
 * stored — Google only returns it on first consent.
 */
export async function storeGooglePlatformCredentials(
    params: StoreCredentialsParams,
): Promise<StoreCredentialsResult> {
    const admin = createAdminClient();
    const credentialError =
        "Could not secure Google credentials. Please try connecting again.";

    const { data: existingPlatform } = await admin
        .from("review_platforms")
        .select("refresh_token")
        .eq("business_id", params.businessId)
        .eq("platform", "google")
        .maybeSingle();

    const { data: encAccess, error: encAccessError } = await admin.rpc("encrypt_token", {
        plaintext: params.accessToken || "",
    });
    if (encAccessError || !encAccess) {
        logger.error({ err: encAccessError }, "[Onboarding] encrypt_token failed for access token");
        return { ok: false, error: credentialError };
    }

    let encRefresh: string | null = null;
    if (params.refreshToken) {
        const { data: encrypted, error: encRefreshError } = await admin.rpc("encrypt_token", {
            plaintext: params.refreshToken,
        });
        if (encRefreshError || !encrypted) {
            logger.error({ err: encRefreshError }, "[Onboarding] encrypt_token failed for refresh token");
            return { ok: false, error: credentialError };
        }
        encRefresh = encrypted;
    }

    const refreshTokenToStore = encRefresh ?? existingPlatform?.refresh_token ?? null;
    if (!refreshTokenToStore) {
        return {
            ok: false,
            error:
                "Google did not provide a refresh token. Disconnect Google in Integrations (if shown), then connect again from this step.",
        };
    }

    const expiresInSeconds =
        typeof params.expiresIn === "number" &&
        Number.isFinite(params.expiresIn) &&
        params.expiresIn > 0
            ? params.expiresIn
            : DEFAULT_EXPIRES_IN_SECONDS;

    const { error: platformUpsertError } = await admin.from("review_platforms").upsert(
        {
            business_id: params.businessId,
            platform: "google",
            access_token: encAccess,
            refresh_token: refreshTokenToStore,
            token_expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
            google_account_id: params.googleAccountId,
            google_location_id: params.googleLocationId,
            external_id: params.googleLocationId,
            external_url: params.googleReviewUrl,
            total_reviews: params.reviewCount,
            average_rating: params.averageRating,
            sync_status: "active",
            /*
             * granted_scopes is NOT written yet.
             *
             * The column ships in 20260807120000_add_google_granted_scopes.sql,
             * which is unapplied. Writing it before the column exists would fail
             * this upsert at runtime and break the entire Google connect flow —
             * and it would typecheck cleanly, because an object spread defeats
             * the excess-property check that would otherwise catch it.
             *
             * Enable together with that migration; `params.grantedScopes` is
             * already plumbed through from the token response and ready.
             */
            updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id,platform" },
    );

    if (platformUpsertError) {
        logger.error({ err: platformUpsertError }, "[Onboarding] review_platforms upsert failed");
        return { ok: false, error: "Failed to save Google connection. Please try again." };
    }

    const { data: platformData } = await admin
        .from("review_platforms")
        .select("id")
        .eq("business_id", params.businessId)
        .eq("platform", "google")
        .single();

    return { ok: true, platformId: platformData?.id ?? null };
}
