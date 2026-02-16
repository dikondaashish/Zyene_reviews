import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, getPlanByPriceId } from "@/lib/stripe/plans";
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

                const planInfo = getPlanByPriceId(priceId);
                const planKey = planInfo?.key || "starter";
                const planLimits = planInfo?.plan.limits || PLANS.starter.limits;

                await supabase
                    .from("organizations")
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan: planKey,
                        plan_status: "active",
                        max_businesses: planLimits.maxBusinesses,
                        max_review_requests_per_month: planLimits.maxReviewRequestsPerMonth,
                        max_ai_replies_per_month: planLimits.maxAiRepliesPerMonth,
                    })
                    .eq("id", organizationId);

                console.log(`✅ Organization ${organizationId} upgraded to ${planKey}`);
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
                    const planInfo = getPlanByPriceId(priceId);
                    if (planInfo) {
                        updateData.plan = planInfo.key;
                        updateData.max_businesses = planInfo.plan.limits.maxBusinesses;
                        updateData.max_review_requests_per_month =
                            planInfo.plan.limits.maxReviewRequestsPerMonth;
                        updateData.max_ai_replies_per_month =
                            planInfo.plan.limits.maxAiRepliesPerMonth;
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

                const freeLimits = PLANS.free.limits;

                await supabase
                    .from("organizations")
                    .update({
                        plan: "free",
                        plan_status: "canceled",
                        stripe_subscription_id: null,
                        max_businesses: freeLimits.maxBusinesses,
                        max_review_requests_per_month: freeLimits.maxReviewRequestsPerMonth,
                        max_ai_replies_per_month: freeLimits.maxAiRepliesPerMonth,
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
        // Still return 200 to prevent Stripe retries for processing errors
    }

    return NextResponse.json({ received: true });
}
