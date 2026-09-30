import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { withStripeWebhookClaim } from "./webhook-claim";

import { handleCheckoutSessionCompleted } from "./webhook-checkout-completed";
import {
    handleSubscriptionDeleted,
    handleSubscriptionUpdated,
} from "./webhook-subscription-changed";
import {
    handleInvoicePaymentFailed,
    handleInvoicePaymentSucceeded,
} from "./webhook-invoice-events";

/**
 * Stripe Webhook handler.
 * IMPORTANT: This route must NOT use the default body parser.
 * We read the raw body for signature verification.
 */
export async function handleStripeWebhook(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    if (!webhookSecret) {
        logger.error("STRIPE_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        logger.error({ err: message }, "Webhook signature verification failed:");
        Sentry.captureException(err, {
            tags: { route: "stripe-webhook", error_type: "signature_verification" },
        });
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        const result = await withStripeWebhookClaim(supabase, event.id, async () => {
          switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event, supabase);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event, supabase);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event, supabase);
                break;
            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event, supabase);
                break;
            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event, supabase);
                break;
            default:
                break;
          }
        });
        if (result === "in-progress") {
            return NextResponse.json({ error: "Webhook already processing" }, { status: 503 });
        }
    } catch (error: unknown) {
        logger.error({ err: error }, "Webhook processing error:");
        if (event) {
            Sentry.captureException(error, {
                tags: { route: "stripe-webhook", event_type: event.type },
                extra: { event_id: event.id },
            });
        }
        // Return 500 so Stripe retries this event
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
