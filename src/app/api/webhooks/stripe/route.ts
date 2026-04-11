import { stripe } from "@/services/stripe/client";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getPlanByPriceId, FREE_LIMITS } from "@/services/stripe/plans";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { StripeOrganizationUpdatePayload } from "@/types/api-routes";
import { sendEmail } from "@/services/resend/send-email";
import { subscriptionSuccessEmail } from "@/services/resend/templates/subscription-success-email";
import { paymentSuccessEmail } from "@/services/resend/templates/payment-success-email";
import { paymentFailedEmail } from "@/services/resend/templates/payment-failed-email";
import { subscriptionCanceledEmail } from "@/services/resend/templates/subscription-canceled-email";

/**
 * Stripe Webhook handler.
 * IMPORTANT: This route must NOT use the default body parser.
 * We read the raw body for signature verification.
 */
export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Webhook signature verification failed:", message);
        Sentry.captureException(err, { tags: { route: "stripe-webhook", error_type: "signature_verification" } });
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    const supabase = createAdminClient();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const organizationId = session.metadata?.organization_id;

                if (!organizationId) {
                    console.error("No organization_id in checkout session metadata");
                    Sentry.captureMessage("Stripe checkout session missing organization_id metadata", { level: "error", extra: { session_id: session.id } });
                    break;
                }

                // Idempotency: Skip if this subscription is already linked
                const { data: existingOrg } = await supabase
                    .from("organizations")
                    .select("stripe_subscription_id")
                    .eq("id", organizationId)
                    .single();

                if (existingOrg?.stripe_subscription_id === subscriptionId) {
                    console.log(`⚡ Skipping duplicate checkout.session.completed for org ${organizationId}`);
                    break;
                }

                // Fetch the subscription to get the price ID
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price?.id;

                if (!priceId) {
                    console.error("No price ID found in subscription");
                    Sentry.captureMessage("Stripe checkout subscription missing price ID", { level: "error", extra: { subscription_id: subscription.id } });
                    break;
                }

                const plan = getPlanByPriceId(priceId);
                const planId = plan?.id || "starter_monthly";
                const limits = plan?.limits || {
                    maxLocations: 1,
                    emailRequestsPerMonth: 2500,
                    smsRequestsPerMonth: 2500,
                    linkRequestsPerMonth: 5000,
                    smartRepliesPerMonth: -1,
                    teamMembers: 5,
                };

                await supabase
                    .from("organizations")
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan: planId,
                        plan_status: "active",
                        max_businesses: limits.maxLocations,
                        max_review_requests_per_month: limits.emailRequestsPerMonth + limits.smsRequestsPerMonth + limits.linkRequestsPerMonth,
                        max_ai_replies_per_month: limits.smartRepliesPerMonth,
                        max_email_requests_per_month: limits.emailRequestsPerMonth,
                        max_sms_requests_per_month: limits.smsRequestsPerMonth,
                        max_link_requests_per_month: limits.linkRequestsPerMonth,
                    })
                    .eq("id", organizationId);

                console.log(`✅ Organization ${organizationId} upgraded to ${planId}`);

                // Send Success Email
                try {
                    const customerEmail = session.customer_details?.email;
                    const customerName = session.customer_details?.name || "there";

                    if (customerEmail) {
                        const isTrial = subscription.status === "trialing";
                        const planName = plan?.name || "Starter";
                        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard`;

                        await sendEmail({
                            to: customerEmail,
                            subject: isTrial ? `Your ${planName} trial has started!` : `Welcome to the ${planName} plan!`,
                            html: subscriptionSuccessEmail({
                                userName: customerName,
                                planName,
                                isTrial,
                                dashboardUrl,
                            }),
                        });
                    }
                } catch (emailErr) {
                    console.error("Error sending subscription success email:", emailErr);
                    Sentry.captureException(emailErr, { extra: { organizationId, eventType: "checkout.session.completed" } });
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const priceId = subscription.items.data[0]?.price?.id;
                const status = subscription.status;

                // Map Stripe status to our plan_status
                let planStatus = "active";
                if (status === "past_due") planStatus = "past_due";
                else if (status === "canceled" || status === "unpaid") planStatus = "canceled";
                else if (status === "trialing") planStatus = "trialing";

                const updateData: StripeOrganizationUpdatePayload = {
                    plan_status: planStatus,
                    stripe_subscription_id: subscription.id,
                };

                // If price changed, update plan and limits
                if (priceId) {
                    const plan = getPlanByPriceId(priceId);
                    if (plan) {
                        updateData.plan = plan.id;
                        updateData.max_businesses = plan.limits.maxLocations;
                        updateData.max_review_requests_per_month =
                            plan.limits.emailRequestsPerMonth + plan.limits.smsRequestsPerMonth + plan.limits.linkRequestsPerMonth;
                        updateData.max_ai_replies_per_month = plan.limits.smartRepliesPerMonth;
                        updateData.max_email_requests_per_month = plan.limits.emailRequestsPerMonth;
                        updateData.max_sms_requests_per_month = plan.limits.smsRequestsPerMonth;
                        updateData.max_link_requests_per_month = plan.limits.linkRequestsPerMonth;
                    }
                }

                await supabase
                    .from("organizations")
                    .update(updateData)
                    .eq("stripe_customer_id", customerId);

                console.log(`🔄 Subscription updated for customer ${customerId}: ${planStatus}`);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const { data: canceledOrg } = await supabase
                    .from("organizations")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .maybeSingle();

                await supabase
                    .from("organizations")
                    .update({
                        plan: "free",
                        plan_status: "canceled",
                        stripe_subscription_id: null,
                        max_businesses: FREE_LIMITS.maxLocations,
                        max_review_requests_per_month: FREE_LIMITS.emailRequestsPerMonth + FREE_LIMITS.smsRequestsPerMonth + FREE_LIMITS.linkRequestsPerMonth,
                        max_ai_replies_per_month: FREE_LIMITS.smartRepliesPerMonth,
                        max_email_requests_per_month: FREE_LIMITS.emailRequestsPerMonth,
                        max_sms_requests_per_month: FREE_LIMITS.smsRequestsPerMonth,
                        max_link_requests_per_month: FREE_LIMITS.linkRequestsPerMonth,
                    })
                    .eq("stripe_customer_id", customerId);

                if (canceledOrg?.id) {
                    await supabase
                        .from("businesses")
                        .update({ auto_reply_enabled: false, auto_reply_enabled_at: null })
                        .eq("organization_id", canceledOrg.id);
                }

                console.log(`❌ Subscription canceled for customer ${customerId}`);

                // Send Cancellation Email
                try {
                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                    if (customer && !customer.deleted && customer.email) {
                        const endDate = subscription.current_period_end 
                            ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                            : "the end of your billing period";

                        await sendEmail({
                            to: customer.email,
                            subject: "Subscription Canceled - We're sorry to see you go",
                            html: subscriptionCanceledEmail({
                                userName: customer.name || "there",
                                endDate,
                                rejoinUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/settings/billing`,
                            }),
                        });
                    }
                } catch (emailErr) {
                    console.error("Error sending cancellation email:", emailErr);
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                await supabase
                    .from("organizations")
                    .update({ plan_status: "past_due" })
                    .eq("stripe_customer_id", customerId);

                console.log(`⚠️ Payment failed for customer ${customerId}`);

                // Send Payment Failed Email
                try {
                    if (invoice.customer_email) {
                        await sendEmail({
                            to: invoice.customer_email,
                            subject: "Payment Failed - Action Required",
                            html: paymentFailedEmail({
                                userName: invoice.customer_name || "there",
                                amount: new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: (invoice.currency || 'usd').toUpperCase(),
                                }).format((invoice.amount_due || 0) / 100),
                                updateCardUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/settings/billing`,
                            }),
                        });
                    }
                } catch (emailErr) {
                    console.error("Error sending payment failed email:", emailErr);
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                
                // Only send for recurring subscription payments (not for the very first one which is handled by checkout.session.completed)
                if (invoice.billing_reason === "subscription_cycle") {
                    try {
                        if (invoice.customer_email) {
                            await sendEmail({
                                to: invoice.customer_email,
                                subject: "Payment Successful - Zyene Reviews",
                                html: paymentSuccessEmail({
                                    userName: invoice.customer_name || "there",
                                    amount: new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: (invoice.currency || 'usd').toUpperCase(),
                                    }).format((invoice.amount_paid || 0) / 100),
                                    date: new Date().toLocaleDateString(),
                                    invoiceUrl: invoice.hosted_invoice_url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/settings/billing`,
                                }),
                            });
                        }
                    } catch (emailErr) {
                        console.error("Error sending payment success email:", emailErr);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error: unknown) {
        console.error("Webhook processing error:", error);
        if (event) {
            Sentry.captureException(error, {
                tags: { route: "stripe-webhook", event_type: event.type },
                extra: { event_id: event.id },
            });
        }
        // Return 500 so Stripe retries this event
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }

    return NextResponse.json({ received: true });
}
