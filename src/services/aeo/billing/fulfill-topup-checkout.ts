import { logger } from "@/lib/logger";
import { AEO_TOPUP_CHECKOUT_KIND } from "@/lib/billing/aeo-topup-catalog";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

type TopupSession = {
    id: string;
    mode?: string | null;
    payment_status?: string | null;
    amount_total?: number | null;
    metadata?: Record<string, string> | null;
};

export function isAeoTopupCheckoutSession(session: { metadata?: Record<string, string> | null }): boolean {
    return session.metadata?.kind === AEO_TOPUP_CHECKOUT_KIND;
}

/** Isolated cast: aeo_apply_credit_topup is not in generated database.types.ts yet. */
function applyTopup(supabase: WebhookAdminClient, args: Record<string, string | number>) {
    return (
        supabase as unknown as {
            rpc: (fn: "aeo_apply_credit_topup", a: Record<string, string | number>) => Promise<{
                data: boolean | null;
                error: { message: string } | null;
            }>;
        }
    ).rpc("aeo_apply_credit_topup", args);
}

/**
 * Credits a paid "Add balance" checkout. The amount comes from what Stripe
 * actually collected (amount_total), never from metadata. Idempotent per
 * session in SQL, so Stripe redeliveries are harmless; errors throw so the
 * webhook stays retryable.
 */
export async function fulfillAeoTopupCheckout(session: TopupSession, supabase: WebhookAdminClient) {
    const organizationId = session.metadata?.organization_id;
    const amountCents = session.amount_total ?? 0;

    if (session.mode !== "payment" || !organizationId || amountCents <= 0) {
        logger.error({ sessionId: session.id }, "AEO top-up checkout missing required data");
        throw new Error("AEO top-up checkout missing required data");
    }
    if (session.payment_status !== "paid") {
        logger.warn({ sessionId: session.id, status: session.payment_status }, "AEO top-up not paid yet; not credited");
        return;
    }

    const { data, error } = await applyTopup(supabase, {
        p_organization_id: organizationId,
        p_checkout_session_id: session.id,
        p_amount_micro_usd: amountCents * 10_000,
    });
    if (error) {
        logger.error({ err: error, sessionId: session.id }, "Failed to credit AEO top-up");
        throw new Error(`aeo_apply_credit_topup failed: ${error.message}`);
    }
    logger.info({ sessionId: session.id, organizationId, amountCents, credited: data }, "AEO top-up processed");
}
