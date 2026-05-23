import { logger } from "@/lib/logger";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === "development") {
    logger.error("Missing STRIPE_SECRET_KEY environment variable. " +
            "Check your .env.local file or deployment environment.");
}

// Next.js evaluates route handlers during build. Using a dummy key prevents 
// the build from crashing when secrets aren't available in CI.
export const stripe = new Stripe(stripeSecretKey || "sk_test_dummy", {
    typescript: true,
});
