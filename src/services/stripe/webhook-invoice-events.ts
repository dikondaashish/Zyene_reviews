import { appEmailUrl } from "@/lib/email/app-email-url";
import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { applySubscriptionProjection } from "@/services/stripe/subscription-projection";
import { invoiceServicePeriodEnd } from "@/services/stripe/invoice-service-period";

import { logger } from "@/lib/logger";
import { sendEmail } from "@/services/resend/send-email";
import { paymentFailedEmail } from "@/services/resend/templates/payment-failed-email";
import { paymentSuccessEmail } from "@/services/resend/templates/payment-success-email";
import { sendMetaPaidSubscriptionEvent, shouldTrackFirstPaidSubscription } from "@/services/stripe/meta-paid-subscription-event";

import type { WebhookAdminClient } from "./webhook-types";

function formatInvoiceAmount(amountInCents: number, currency: string | null | undefined): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "usd").toUpperCase(),
    }).format(amountInCents / 100);
}

export async function handleInvoicePaymentFailed(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

    const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
    if (!invoiceSubscription) return;
    if (!customerId) throw new Error("Invoice customer missing");
    const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription.id;
    const observedAt = new Date().toISOString();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if ((typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id) !== customerId) {
        throw new Error("Invoice subscription customer mismatch");
    }
    const updatedOrgId = await applySubscriptionProjection(supabase, customerId, subscriptionId,
        stripeSubscriptionToOrganizationUpdate(subscription), { observedAt });
    if (!updatedOrgId || subscription.status !== "past_due") return;

    try {
        if (invoice.customer_email) {
            await sendEmail({
                stream: "billing",
                to: invoice.customer_email,
                subject: "Payment Failed - Action Required",
                html: paymentFailedEmail({
                    userName: invoice.customer_name || "there",
                    amount: formatInvoiceAmount(invoice.amount_due || 0, invoice.currency),
                    updateCardUrl: appEmailUrl("/settings/billing"),
                }),
            });
        }
    } catch (emailErr) {
        logger.error({ err: emailErr }, "Error sending payment failed email:");
    }
}

export async function handleInvoicePaymentSucceeded(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const invoice = event.data.object as Stripe.Invoice;

    const isRenewal = invoice.billing_reason === "subscription_cycle";
    const isNewSubscription = invoice.billing_reason === "subscription_create";
    if (!isRenewal && !isNewSubscription) return;

    // Resolve the invoice binding before any financial write.
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
    if (!customerId || !invoiceSubscription) throw new Error("Invoice billing binding missing");
    const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription.id;
    const { data: currentOrg, error } = await supabase
        .from("organizations").select("id, plan")
        .eq("stripe_customer_id", customerId)
        .eq("stripe_subscription_id", subscriptionId).maybeSingle();
    if (error) throw error;
    let org = currentOrg;
    let subscriptionPendingBinding = false;
    let subscription: Stripe.Subscription | null = null;

    if (org || isNewSubscription) {
        try {
            const retrieved = await stripe.subscriptions.retrieve(subscriptionId);
            const retrievedCustomerId = typeof retrieved.customer === "string" ? retrieved.customer : retrieved.customer?.id;
            if (retrievedCustomerId === customerId) subscription = retrieved;
            else logger.warn({ invoiceId: invoice.id }, "Meta conversion skipped because Stripe customer binding mismatched");
        } catch {
            // Conversion measurement is best effort; it must not block billing writes.
            logger.warn({ invoiceId: invoice.id }, "Meta conversion could not retrieve the Stripe subscription");
        }
    }

    // Stripe can deliver the first paid invoice before checkout.session.completed.
    // The signed subscription metadata lets us verify that one new subscription
    // without accepting an older subscription that has since been replaced.
    if (!org && isNewSubscription && subscription?.metadata.organization_id) {
        const pendingLookup = await supabase
            .from("organizations").select("id, plan, stripe_subscription_id")
            .eq("id", subscription.metadata.organization_id)
            .eq("stripe_customer_id", customerId).maybeSingle();
        if (pendingLookup.error) throw pendingLookup.error;
        if (pendingLookup.data?.stripe_subscription_id === null) {
            org = pendingLookup.data;
            subscriptionPendingBinding = true;
        }
    }
    if (!org) return;

    const subscriptionLine = subscription && invoice.lines.data.find((line) => {
        const lineSubscription = line.subscription ?? line.parent?.subscription_item_details?.subscription;
        return (typeof lineSubscription === "string" ? lineSubscription : lineSubscription?.id) === subscriptionId;
    });
    if (subscription && shouldTrackFirstPaidSubscription({
        invoiceStatus: invoice.status,
        amountPaid: invoice.amount_paid,
        billingReason: invoice.billing_reason,
        trialEnd: subscription.trial_end,
        servicePeriodStart: subscriptionLine?.period.start ?? null,
    })) {
        await sendMetaPaidSubscriptionEvent({
            invoiceId: invoice.id,
            eventTime: invoice.status_transitions?.paid_at ?? event.created,
            metadata: subscription.metadata,
        });
    }

    // Initial invoice handling belongs to checkout.session.completed. The fallback
    // above only exists so the Meta event is not lost when Stripe reorders webhooks.
    if (!isRenewal || subscriptionPendingBinding) return;
    const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
    await resetAeoCreditsForPlan(supabase, { organizationId: org.id, planId: org.plan,
        customerId, subscriptionId, receiptId: invoice.id,
        periodEnd: await invoiceServicePeriodEnd(invoice, subscriptionId, org.plan) });

    try {
        if (invoice.customer_email) {
            await sendEmail({
                stream: "billing",
                to: invoice.customer_email,
                subject: "Payment Successful - Zyene Reviews",
                html: paymentSuccessEmail({
                    userName: invoice.customer_name || "there",
                    amount: formatInvoiceAmount(invoice.amount_paid || 0, invoice.currency),
                    date: new Date().toLocaleDateString(),
                    invoiceUrl:
                        invoice.hosted_invoice_url ||
                        appEmailUrl("/settings/billing"),
                }),
            });
        }
    } catch (emailErr) {
        logger.error({ err: emailErr }, "Error sending payment success email:");
    }
}
