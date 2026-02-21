import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByPriceId, FREE_LIMITS } from "@/lib/stripe/plans";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
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
                    break;
                }

                // Fetch the subscription to get the price ID
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price?.id;

                if (!priceId) {
                    console.error("No price ID found in subscription");
                    break;
                }

                const plan = getPlanByPriceId(priceId);
                const planId = plan?.id || "starter_monthly";
                const limits = plan?.limits || {
                    maxLocations: 1,
                    emailRequestsPerMonth: 2500,
                    smsRequestsPerMonth: 2500,
                    linkRequestsPerMonth: 5000,
                    aiRepliesPerMonth: -1,
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
                        max_ai_replies_per_month: limits.aiRepliesPerMonth,
                        max_email_requests_per_month: limits.emailRequestsPerMonth,
                        max_sms_requests_per_month: limits.smsRequestsPerMonth,
                        max_link_requests_per_month: limits.linkRequestsPerMonth,
                    })
                    .eq("id", organizationId);

                console.log(`✅ Organization ${organizationId} upgraded to ${planId}`);
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

                const updateData: any = {
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
                        updateData.max_ai_replies_per_month = plan.limits.aiRepliesPerMonth;
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
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                await supabase
                    .from("organizations")
                    .update({
                        plan: "free",
                        plan_status: "canceled",
                        stripe_subscription_id: null,
                        max_businesses: FREE_LIMITS.maxLocations,
                        max_review_requests_per_month: FREE_LIMITS.emailRequestsPerMonth + FREE_LIMITS.smsRequestsPerMonth + FREE_LIMITS.linkRequestsPerMonth,
                        max_ai_replies_per_month: FREE_LIMITS.aiRepliesPerMonth,
                        max_email_requests_per_month: FREE_LIMITS.emailRequestsPerMonth,
                        max_sms_requests_per_month: FREE_LIMITS.smsRequestsPerMonth,
                        max_link_requests_per_month: FREE_LIMITS.linkRequestsPerMonth,
                    })
                    .eq("stripe_customer_id", customerId);

                console.log(`❌ Subscription canceled for customer ${customerId}`);
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
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error: any) {
        console.error("Webhook processing error:", error);
    }

    return NextResponse.json({ received: true });
}
