import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import {
    AEO_TOPUP_CHECKOUT_KIND,
    AEO_TOPUP_MAX_USD,
    AEO_TOPUP_MIN_USD,
    testsForAmount,
} from "@/lib/billing/aeo-topup-catalog";
import { stripe } from "@/services/stripe/client";

const topupSchema = z.object({
    amountUsd: z.number().int().min(AEO_TOPUP_MIN_USD).max(AEO_TOPUP_MAX_USD),
});

/** POST /api/aeo/balance/checkout - starts a one-time Stripe Checkout for prepaid AEO balance. */
export async function handleAeoTopupCheckout(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/aeo/balance/checkout");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    if (!isMeteredBillingLive()) {
        return apiError("AEO balance is not enabled yet.", { status: 409, details: requestId });
    }

    const parsed = topupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return apiError(`Choose a whole-dollar amount between $${AEO_TOPUP_MIN_USD} and $${AEO_TOPUP_MAX_USD}.`, {
            status: 400,
            details: requestId,
        });
    }
    const { amountUsd } = parsed.data;

    try {
        const membership = await loadActiveBillingMember(user.id);
        if (membership.kind !== "ok" || !membership.member?.organizations) {
            return apiError("No active organization found", { status: 400, details: requestId });
        }
        if (!isOrganizationOwnerRole(membership.member.role)) {
            return apiError("Only the organization owner can add balance.", { status: 403, details: requestId });
        }

        const org = membership.member.organizations;
        const origin = new URL(request.url).origin;
        const metadata = {
            kind: AEO_TOPUP_CHECKOUT_KIND,
            organization_id: org.id,
            user_id: user.id,
            amount_usd: String(amountUsd),
        };

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            // Card only: the balance is credited on checkout.session.completed,
            // which for delayed methods fires before the money has arrived.
            payment_method_types: ["card"],
            ...(org.stripe_customer_id ? { customer: org.stripe_customer_id } : { customer_email: user.email }),
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        unit_amount: amountUsd * 100,
                        product_data: {
                            name: "AI visibility test balance",
                            description: `About ${testsForAmount(amountUsd)} tests. Never expires.`,
                        },
                    },
                },
            ],
            metadata,
            payment_intent_data: { metadata },
            success_url: `${origin}/google-seo-aeo?topup=success`,
            cancel_url: `${origin}/google-seo-aeo?topup=canceled`,
        });

        if (!session.url) {
            logger.error({ requestId }, "AEO top-up checkout session missing URL");
            return apiError("Unable to start checkout", { status: 502, details: requestId });
        }
        return apiOk({ url: session.url });
    } catch (err) {
        logger.error({ err, requestId }, "AEO top-up checkout failed");
        return apiError("Unable to start checkout", { status: 502, details: requestId });
    }
}
