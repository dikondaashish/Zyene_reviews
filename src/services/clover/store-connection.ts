import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import type { CloverTokenResponse } from "@/services/clover/oauth";
import { getCloverEnvForStorage } from "@/services/clover/api-client";
import { cloverUnixSecondsToIso } from "@/services/clover/config";

type Admin = ReturnType<typeof createAdminClient>;

export async function storeCloverConnection(args: {
    admin: Admin;
    businessId: string;
    merchantId: string;
    tokens: CloverTokenResponse;
}): Promise<void> {
    const { admin, businessId, merchantId, tokens } = args;

    const { data: encAccess, error: encAccessError } = await admin.rpc("encrypt_token", {
        plaintext: tokens.access_token,
    });
    if (encAccessError || !encAccess) {
        throw encAccessError ?? new Error("Failed to encrypt Clover access token");
    }

    let encRefresh: string | null = null;
    if (tokens.refresh_token) {
        const { data, error } = await admin.rpc("encrypt_token", {
            plaintext: tokens.refresh_token,
        });
        if (error || !data) throw error ?? new Error("Failed to encrypt Clover refresh token");
        encRefresh = data;
    }

    const row = {
        business_id: businessId,
        merchant_id: merchantId,
        access_token_encrypted: encAccess as string,
        refresh_token_encrypted: encRefresh,
        access_token_expires_at: cloverUnixSecondsToIso(tokens.access_token_expiration),
        refresh_token_expires_at: cloverUnixSecondsToIso(tokens.refresh_token_expiration),
        environment: getCloverEnvForStorage(),
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_error: null,
        auto_send_enabled: false,
    };

    const { error } = await admin.from("clover_connections").upsert(row, {
        onConflict: "business_id",
    });
    if (error) {
        logger.error({ err: error, businessId, merchantId }, "[clover] store connection failed");
        throw error;
    }
}
