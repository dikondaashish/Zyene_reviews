import { stripe } from "@/services/stripe/client";

/**
 * Stripe Checkout `subscription_data.trial_period_days` should apply only for
 * net-new subscribers. Anyone who has ever had a subscription on this customer
 * (including canceled) should not get another intro trial on a new checkout.
 */
export async function isEligibleForIntroTrial(stripeCustomerId: string | null): Promise<boolean> {
    if (!stripeCustomerId) return true;
    try {
        const subs = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "all",
            limit: 100,
        });
        return subs.data.length === 0;
    } catch (e) {
        console.error("[checkout-trial-eligibility] subscriptions.list failed", e);
        return true;
    }
}
