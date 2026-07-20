import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import type { SquareTokenResponse } from "@/services/square/oauth";
import { getSquareEnvironment } from "@/services/square/config";

type Admin = ReturnType<typeof createAdminClient>;

export async function storeSquareConnection(args: {
    admin: Admin;
    businessId: string;
    merchantId: string;
    tokens: SquareTokenResponse;
}): Promise<void> {
    const { admin, businessId, merchantId, tokens } = args;
    const environment = getSquareEnvironment();

    const { data: encAccess, error: encAccessError } = await admin.rpc("encrypt_token", {
        plaintext: tokens.access_token,
    });
    if (encAccessError || !encAccess) {
        throw encAccessError ?? new Error("Failed to encrypt Square access token");
    }

    let encRefresh: string | null = null;
    if (tokens.refresh_token) {
        const { data, error } = await admin.rpc("encrypt_token", {
            plaintext: tokens.refresh_token,
        });
        if (error || !data) throw error ?? new Error("Failed to encrypt Square refresh token");
        encRefresh = data;
    }

    // One merchant ↔ one business. Clear prior link for this business or this merchant+env
    // so reconnect / switch-business does not hit unique (merchant_id, environment).
    const { error: delBizErr } = await admin
        .from("square_connections")
        .delete()
        .eq("business_id", businessId);
    if (delBizErr) throw delBizErr;

    const { error: delMerchErr } = await admin
        .from("square_connections")
        .delete()
        .eq("merchant_id", merchantId)
        .eq("environment", environment);
    if (delMerchErr) throw delMerchErr;

    const row = {
        business_id: businessId,
        merchant_id: merchantId,
        access_token_encrypted: encAccess as string,
        refresh_token_encrypted: encRefresh,
        access_token_expires_at: tokens.expires_at ?? null,
        environment,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_error: null,
        auto_send_enabled: false,
        disconnected_at: null,
    };

    const { error } = await admin.from("square_connections").insert(row);
    if (error) {
        logger.error({ err: error, businessId, merchantId }, "[square] store connection failed");
        throw error;
    }
}
