import type Stripe from "stripe";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";

const CACHE_SECONDS = 6 * 60 * 60;

/** Monthly amount, in dollars, from what Stripe last invoiced (discounts included). */
export function monthlyChargeFromInvoice(totalCents: number, interval: Stripe.Price.Recurring.Interval | undefined): number {
    const dollars = totalCents / 100;
    return interval === "year" ? dollars / 12 : dollars;
}

/**
 * What this organization actually pays per month, so the dashboard never quotes a list price
 * the customer isn't on. Returns undefined when unknown (caller falls back to the plan catalog),
 * 0 while the last invoice was free (trial or 100% coupon).
 */
export async function loadMonthlyCharge(organizationId: string): Promise<number | undefined> {
    const cacheKey = `org_monthly_charge:${organizationId}`;
    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get<number>(cacheKey);
        if (typeof cached === "number") return cached;
    } catch (err) {
        logger.warn({ err }, "[dashboard] monthly charge cache read failed");
    }

    try {
        const { data: org } = await createAdminClient()
            .from("organizations").select("stripe_subscription_id").eq("id", organizationId).maybeSingle();
        const subId = org?.stripe_subscription_id;
        if (!subId || !process.env.STRIPE_SECRET_KEY) return undefined;

        const sub = await stripe.subscriptions.retrieve(subId, { expand: ["latest_invoice"] });
        const invoice = sub.latest_invoice as Stripe.Invoice | null;
        if (!invoice || typeof invoice !== "object") return undefined;
        const charge = monthlyChargeFromInvoice(invoice.total, sub.items.data[0]?.price.recurring?.interval);

        try {
            const { redis } = await import("@/lib/db/redis");
            await redis.set(cacheKey, charge, { ex: CACHE_SECONDS });
        } catch (err) {
            logger.warn({ err }, "[dashboard] monthly charge cache write failed");
        }
        return charge;
    } catch (err) {
        logger.warn({ err, organizationId }, "[dashboard] monthly charge load failed");
        return undefined;
    }
}
