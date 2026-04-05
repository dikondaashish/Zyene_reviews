import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        "Missing STRIPE_SECRET_KEY environment variable. " +
            "Check your .env.local file or deployment environment."
    );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
});
