import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getSquareEnvironment } from "@/services/square/config";
import type { ParsedSquareRevokeEvent } from "@/services/square/webhook-parse";

/** Mark connection disconnected when Square revokes OAuth. */
export async function processSquareRevokeEvent(event: ParsedSquareRevokeEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getSquareEnvironment();

    const { data, error } = await admin
        .from("square_connections")
        .update({
            disconnected_at: new Date().toISOString(),
            auto_send_enabled: false,
            updated_at: new Date().toISOString(),
            last_error: "oauth.authorization.revoked",
        })
        .eq("merchant_id", event.merchantId)
        .eq("environment", env)
        .is("disconnected_at", null)
        .select("id, business_id");

    if (error) {
        logger.error({ err: error, merchantId: event.merchantId }, "[square] revoke update failed");
        return;
    }

    logger.info(
        { merchantId: event.merchantId, updated: data?.length ?? 0 },
        "[square] OAuth revoked — connection disconnected",
    );
}
