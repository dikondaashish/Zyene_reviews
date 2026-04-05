import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import { PLANS } from "@/services/stripe/plans";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const priceIdRaw = body.priceId as string | undefined;
        const planId = body.planId as string | undefined;
        const source = body.source === "onboarding" ? "onboarding" : "billing";

        let priceId = priceIdRaw;
        if (!priceId && planId && typeof planId === "string") {
            const plan = PLANS.find((p) => p.id === planId);
            priceId = plan?.stripePriceId || undefined;
        }

        if (!priceId || typeof priceId !== "string") {
            return NextResponse.json(
                { error: "priceId or a valid planId is required" },
                { status: 400 }
            );
        }

        // Security: Validate priceId against known plans to prevent spoofing
        const validPriceIds = PLANS
            .map((p) => p.stripePriceId)
            .filter(Boolean);

        if (!validPriceIds.includes(priceId)) {
            return NextResponse.json(
                { error: "Invalid plan selected" },
                { status: 400 }
            );
        }

        // Get user's organization
        interface OrgMemberWithRole {
            role: string;
            organizations: {
                id: string;
                stripe_customer_id: string | null;
                stripe_subscription_id: string | null;
                name: string;
            } | null;
        }

        const admin = createAdminClient();
        const { data: member } = await admin
            .from("organization_members")
            .select("organization_id, role, organizations(*)")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json(
                { error: "No organization found" },
                { status: 404 }
            );
        }

        // Security: Only owners, admins, and managers can manage billing
        const memberTyped = member as unknown as OrgMemberWithRole;
        const memberRole = memberTyped.role;
        if (!memberRole || !["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"].includes(memberRole)) {
            return NextResponse.json(
                { error: "You don't have permission to manage billing. Contact your organization owner." },
                { status: 403 }
            );
        }

        const org = memberTyped.organizations;
        if (!org) {
            return NextResponse.json({ error: "Organization details not found" }, { status: 404 });
        }
        let stripeCustomerId = org.stripe_customer_id;

        // Create Stripe customer if needed
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: org.name,
                metadata: {
                    organization_id: member.organization_id,
                    supabase_user_id: user.id,
                },
            });
            stripeCustomerId = customer.id;

            // Save Stripe customer ID
            await admin
                .from("organizations")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", member.organization_id);
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const dashboardUrl = rootDomain.includes("localhost")
            ? `http://${rootDomain}`
            : `https://app.${rootDomain}`;

        const billingSuccessUrl = `${dashboardUrl}/settings/billing?success=true`;
        const billingCancelUrl = `${dashboardUrl}/settings/billing?canceled=true`;
        const onboardingSuccessUrl = `${dashboardUrl}/onboarding?checkout_success=1&session_id={CHECKOUT_SESSION_ID}`;
        const onboardingCancelUrl = `${dashboardUrl}/onboarding?checkout_canceled=1`;

        // ── Guard: If already subscribed, update plan instead of creating a new subscription ──
        if (org.stripe_subscription_id) {
            try {
                const existingSub = await stripe.subscriptions.retrieve(org.stripe_subscription_id);

                // Only update if the subscription is still active/trialing
                if (["active", "trialing", "past_due"].includes(existingSub.status)) {
                    await stripe.subscriptions.update(org.stripe_subscription_id, {
                        items: [{
                            id: existingSub.items.data[0].id,
                            price: priceId,
                        }],
                        proration_behavior: "create_prorations",
                    });

                    const switchedReturnUrl =
                        source === "onboarding"
                            ? `${dashboardUrl}/onboarding?checkout_success=1&plan_switched=1`
                            : billingSuccessUrl;

                    return NextResponse.json({
                        url: switchedReturnUrl,
                        switched: true,
                    });
                }
            } catch (subError: any) {
                // If subscription retrieval fails (deleted, etc.), fall through to new checkout
                console.warn("Could not update existing subscription, creating new checkout:", subError.message);
            }
        }

        // ── New subscription checkout ──
        const starterPriceIds = [
            process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
            process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
        ];
        const proPriceIds = [
            process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
            process.env.STRIPE_PRO_YEARLY_PRICE_ID,
        ];

        let couponId: string | undefined;
        if (starterPriceIds.includes(priceId)) {
            couponId = process.env.STRIPE_NEW_CUSTOMER_COUPON_ID;
        } else if (proPriceIds.includes(priceId)) {
            couponId = process.env.STRIPE_NEW_PRO_CUSTOMER_COUPON_ID;
        }

        const successUrl = source === "onboarding" ? onboardingSuccessUrl : billingSuccessUrl;
        const cancelUrl = source === "onboarding" ? onboardingCancelUrl : billingCancelUrl;

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            ...(couponId
                ? { discounts: [{ coupon: couponId }] }
                : { allow_promotion_codes: true }),
            subscription_data: {
                trial_period_days: 7,
                trial_settings: {
                    end_behavior: {
                        missing_payment_method: "cancel",
                    },
                },
            },
            metadata: {
                organization_id: member.organization_id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("Checkout Error:", error);
        Sentry.captureException(error, { tags: { route: "billing-checkout" } });
        return NextResponse.json(
            { error: "Failed to create checkout session. Please try again." },
            { status: 500 }
        );
    }
}
