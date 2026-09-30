import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { applySubscriptionProjection } from "@/services/stripe/subscription-projection";
import { invoiceServicePeriodEnd } from "@/services/stripe/invoice-service-period";

import { logger } from "@/lib/logger";
import { sendEmail } from "@/services/resend/send-email";
import { paymentFailedEmail } from "@/services/resend/templates/payment-failed-email";
import { paymentSuccessEmail } from "@/services/resend/templates/payment-success-email";

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
                to: invoice.customer_email,
                subject: "Payment Failed - Action Required",
                html: paymentFailedEmail({
                    userName: invoice.customer_name || "there",
                    amount: formatInvoiceAmount(invoice.amount_due || 0, invoice.currency),
                    updateCardUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings/billing`,
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

    // Only for recurring payments - the first one is covered by checkout.session.completed.
    if (invoice.billing_reason !== "subscription_cycle") return;

    // Resolve both customer and current subscription before any financial write.
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
    if (!customerId || !invoiceSubscription) throw new Error("Invoice billing binding missing");
    const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription.id;
    const { data: org, error } = await supabase
        .from("organizations").select("id, plan")
        .eq("stripe_customer_id", customerId)
        .eq("stripe_subscription_id", subscriptionId).maybeSingle();
    if (error) throw error;
    if (!org) return;
    const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
    await resetAeoCreditsForPlan(supabase, { organizationId: org.id, planId: org.plan,
        customerId, subscriptionId, receiptId: invoice.id,
        periodEnd: await invoiceServicePeriodEnd(invoice, subscriptionId, org.plan) });

    try {
        if (invoice.customer_email) {
            await sendEmail({
                to: invoice.customer_email,
                subject: "Payment Successful - Zyene Reviews",
                html: paymentSuccessEmail({
                    userName: invoice.customer_name || "there",
                    amount: formatInvoiceAmount(invoice.amount_paid || 0, invoice.currency),
                    date: new Date().toLocaleDateString(),
                    invoiceUrl:
                        invoice.hosted_invoice_url ||
                        `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings/billing`,
                }),
            });
        }
    } catch (emailErr) {
        logger.error({ err: emailErr }, "Error sending payment success email:");
    }
}
