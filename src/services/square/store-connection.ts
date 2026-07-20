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

    const row = {
        business_id: businessId,
        merchant_id: merchantId,
        access_token_encrypted: encAccess as string,
        refresh_token_encrypted: encRefresh,
        access_token_expires_at: tokens.expires_at ?? null,
        environment: getSquareEnvironment(),
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_error: null,
        auto_send_enabled: false,
        disconnected_at: null,
    };

    const { error } = await admin.from("square_connections").upsert(row as never, {
        onConflict: "business_id",
    });
    if (error) {
        logger.error({ err: error, businessId, merchantId }, "[square] store connection failed");
        throw error;
    }
}
