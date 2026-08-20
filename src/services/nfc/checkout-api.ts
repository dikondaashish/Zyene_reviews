import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { stripe } from "@/services/stripe/client";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import {
    NFC_CARD,
    NFC_CHECKOUT_KIND,
    NFC_SHIPPING,
    isNfcShippingId,
    nfcOrderTotals,
} from "@/lib/nfc/catalog";

const checkoutSchema = z.object({
    quantity: z.number().int().min(NFC_CARD.minQty).max(NFC_CARD.maxQty),
    shippingId: z.enum(["standard", "expedited"]),
});

export async function handleNfcCheckout(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/nfc/checkout");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return apiError("Choose a quantity between 1 and 20 and a shipping option.", {
            status: 400,
            details: requestId,
        });
    }

    const { quantity, shippingId } = parsed.data;
    if (!isNfcShippingId(shippingId)) {
        return apiError("Invalid shipping option", { status: 400, details: requestId });
    }

    const { businessId, business, organization } = await getActiveBusinessId({
        skipCache: true,
    });
    if (!businessId || !organization?.id) {
        return apiError("No active business found", { status: 400, details: requestId });
    }

    const totals = nfcOrderTotals(quantity, shippingId);
    const shipping = NFC_SHIPPING[shippingId];
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const origin = new URL(request.url).origin;
    const returnBase = origin || appUrl;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: user.email || undefined,
            success_url: `${returnBase}/dashboard?nfc=success`,
            cancel_url: `${returnBase}/dashboard?nfc=canceled`,
            shipping_address_collection: { allowed_countries: ["US", "CA"] },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: shipping.amountCents, currency: "usd" },
                        display_name: shipping.name,
                        delivery_estimate: {
                            minimum: { unit: "business_day", value: shippingId === "expedited" ? 2 : 5 },
                            maximum: { unit: "business_day", value: shippingId === "expedited" ? 3 : 8 },
                        },
                    },
                },
            ],
            line_items: [
                {
                    quantity: totals.quantity,
                    price_data: {
                        currency: "usd",
                        unit_amount: NFC_CARD.unitAmountCents,
                        product_data: {
                            name: NFC_CARD.name,
                            description: `Review link set for ${business?.name || "your location"}. ${NFC_CARD.description}`,
                            images: [`${appUrl}${NFC_CARD.imageSrc}`],
                        },
                    },
                },
            ],
            metadata: {
                kind: NFC_CHECKOUT_KIND,
                organization_id: organization.id,
                business_id: businessId,
                user_id: user.id,
                quantity: String(totals.quantity),
                shipping_id: shippingId,
            },
        });

        if (!session.url) {
            logger.error({ requestId }, "NFC checkout session missing URL");
            return apiError("Unable to start checkout", { status: 502, details: requestId });
        }

        return apiOk({ url: session.url, totalCents: totals.totalCents });
    } catch (err) {
        logger.error({ err, requestId }, "NFC checkout session failed");
        return apiError("Unable to start checkout", { status: 502, details: requestId });
    }
}
