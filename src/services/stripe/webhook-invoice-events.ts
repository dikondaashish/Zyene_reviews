import type Stripe from "stripe";

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

    if (!customerId) {
        logger.error({ err: invoice.id }, "invoice.payment_failed: missing customer id");
        return;
    }

    await supabase
        .from("organizations")
        .update({ plan_status: "past_due" })
        .eq("stripe_customer_id", customerId);

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

    // Only for recurring payments — the first one is covered by checkout.session.completed.
    if (invoice.billing_reason !== "subscription_cycle") return;

    // Isolated on purpose: a bug in this newer, less-proven feature must never
    // block the payment-success email below, which every renewing customer —
    // AEO or not — relies on today. organizations.plan is read rather than
    // re-derived from the invoice's price id because organization-billing-sync
    // already keeps it current; one row read serves both organization_id and
    // plan id.
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (customerId) {
        try {
            const { data: org } = await supabase
                .from("organizations")
                .select("id, plan")
                .eq("stripe_customer_id", customerId)
                .single();
            if (org) {
                const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
                await resetAeoCreditsForPlan(supabase, { organizationId: org.id, planId: org.plan });
            }
        } catch (creditErr) {
            logger.error({ err: creditErr }, "[AEO] E-9 credit reset failed on renewal");
        }
    }

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
