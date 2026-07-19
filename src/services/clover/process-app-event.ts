import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getCloverEnvironment } from "@/services/clover/config";
import { cloverAppEventAction } from "@/services/clover/app-event-action";
import type { ParsedAppEvent } from "@/services/clover/webhook-parse";

/**
 * Handle Clover App webhook (install / uninstall / subscription).
 * OAuth remains the source of tokens; uninstall stops sends via disconnected_at.
 */
export async function processCloverAppEvent(event: ParsedAppEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getCloverEnvironment();
    const action = cloverAppEventAction(event.eventType);

    if (action === "log_only") {
        logger.info(
            {
                merchantId: event.merchantId,
                eventType: event.eventType,
                appObjectId: event.appObjectId,
            },
            "[clover] app subscription change logged",
        );
        return;
    }

    const { data: connection, error } = await admin
        .from("clover_connections")
        .select("id, business_id")
        .eq("merchant_id", event.merchantId)
        .eq("environment", env)
        .maybeSingle();

    if (error) {
        logger.error({ err: error, merchantId: event.merchantId }, "[clover] app event lookup failed");
        return;
    }

    if (!connection) {
        logger.info(
            { merchantId: event.merchantId, eventType: event.eventType },
            "[clover] app event for unknown merchant — ignore (await OAuth if install)",
        );
        return;
    }

    if (action === "mark_disconnected") {
        const { error: updateError } = await admin
            .from("clover_connections")
            .update({
                disconnected_at: new Date().toISOString(),
                auto_send_enabled: false,
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", connection.id);

        if (updateError) {
            logger.error(
                { err: updateError, merchantId: event.merchantId },
                "[clover] failed to mark disconnected",
            );
            return;
        }

        logger.info(
            {
                businessId: connection.business_id,
                merchantId: event.merchantId,
            },
            "[clover] merchant uninstalled — connection disconnected, auto_send off",
        );
        return;
    }

    // CREATE (install / reinstall signal): clear disconnect flag if row exists.
    // Do not create tokens here — OAuth callback owns that.
    const { error: clearError } = await admin
        .from("clover_connections")
        .update({
            disconnected_at: null,
            updated_at: new Date().toISOString(),
        } as never)
        .eq("id", connection.id);

    if (clearError) {
        logger.error(
            { err: clearError, merchantId: event.merchantId },
            "[clover] failed to clear disconnected_at on install",
        );
        return;
    }

    logger.info(
        {
            businessId: connection.business_id,
            merchantId: event.merchantId,
        },
        "[clover] app install signal — cleared disconnected_at (tokens via OAuth)",
    );
}
