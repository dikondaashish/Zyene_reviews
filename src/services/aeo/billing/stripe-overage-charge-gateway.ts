import Stripe from "stripe";
import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import type { OverageChargeGateway, OverageChargeResult } from "./ports";

/** price_1U2HMAIiQQIaqDALvgvid1Us — "AEO Test Overage", created inactive 2026-08-08. */
export const AEO_OVERAGE_PRICE_ID = "price_1U2HMAIiQQIaqDALvgvid1Us";

/**
 * Ad-hoc Invoice Items rolled into an auto-advanced Invoice — not a Billing
 * Meter, and no subscription item is added to the customer's existing
 * Starter/Professional subscription. Chosen so this can ship without ever
 * touching a live customer's subscription object; see the E-9 implementation
 * planner guidance this was built against (2026-08-08).
 *
 * Idempotency keys are the crash-safety mechanism here, not a lookup of our
 * own state: `sampleId` is stable across an Inngest step replay, so a
 * duplicate call with the same key returns Stripe's ORIGINAL object instead
 * of creating a second charge. This is the Stripe-side twin of
 * aeo_consume_credit's replay guard — the two together close the loop for
 * "STEP 2 — mark intent, then call, INSIDE ONE STEP" style crashes.
 */
export class StripeOverageChargeGateway implements OverageChargeGateway {
    async chargeOverage(input: {
        sampleId: string;
        stripeCustomerId: string;
        amountMicroUsd: number;
    }): Promise<OverageChargeResult> {
        // Stripe cents. Rounds rather than truncates: a truncated fraction of a
        // cent would be silently under-collected on every single overage event.
        const amountCents = Math.round(input.amountMicroUsd / 10_000);

        try {
            await stripe.invoiceItems.create(
                {
                    customer: input.stripeCustomerId,
                    currency: "usd",
                    pricing: { price: AEO_OVERAGE_PRICE_ID },
                },
                { idempotencyKey: `aeo-overage-item-${input.sampleId}` }
            );

            const invoice = await stripe.invoices.create(
                {
                    customer: input.stripeCustomerId,
                    collection_method: "charge_automatically",
                    auto_advance: true,
                },
                { idempotencyKey: `aeo-overage-invoice-${input.sampleId}` }
            );

            const item = invoice.lines?.data.find((line) => line.amount === amountCents);
            return { charged: true, stripeInvoiceItemId: item?.id ?? invoice.id ?? "" };
        } catch (err) {
            // A declined card or a missing payment method is an expected outcome
            // of billing someone automatically, not a bug — return it as data so
            // the caller records the attempt. Anything else (network, rate
            // limit) is re-thrown: the idempotency keys above make an Inngest
            // retry safe, so letting it retry is correct, not risky.
            if (err instanceof Stripe.errors.StripeCardError || err instanceof Stripe.errors.StripeInvalidRequestError) {
                logger.error(
                    { err, sampleId: input.sampleId, stripeCustomerId: input.stripeCustomerId },
                    "[AEO] overage charge declined or invalid"
                );
                return { charged: false, reason: err.message };
            }
            throw err;
        }
    }
}
