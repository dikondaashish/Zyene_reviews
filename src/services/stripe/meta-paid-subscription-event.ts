import { createHash } from "node:crypto";
import { logger } from "@/lib/logger";

const META_GRAPH_API_VERSION = "v26.0";
const META_COOKIE_PATTERN = /^fb\.1\.\d{1,16}\.[A-Za-z0-9._-]{1,200}$/;

export function shouldTrackFirstPaidSubscription(input: {
    invoiceStatus: string | null;
    amountPaid: number;
    billingReason: string | null;
    trialEnd: number | null;
    servicePeriodStart: number | null;
}): boolean {
    if (input.invoiceStatus !== "paid" || input.amountPaid <= 0) return false;
    if (input.billingReason === "subscription_create") return true;
    return input.billingReason === "subscription_cycle" &&
        input.trialEnd !== null &&
        input.servicePeriodStart === input.trialEnd;
}

/** Sends only consented Meta click/browser cookies; never customer contact data. */
export async function sendMetaPaidSubscriptionEvent(input: {
    invoiceId: string;
    eventTime: number;
    metadata: Record<string, string>;
}): Promise<void> {
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
    const datasetId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
    if (!accessToken || !datasetId || input.metadata.meta_marketing_consent !== "1") return;

    const fbp = input.metadata.meta_fbp;
    const fbc = input.metadata.meta_fbc;
    const userData = {
        ...(fbp && META_COOKIE_PATTERN.test(fbp) ? { fbp } : {}),
        ...(fbc && META_COOKIE_PATTERN.test(fbc) ? { fbc } : {}),
    };
    if (Object.keys(userData).length === 0) return;

    const data = [{
        event_name: "Subscribe",
        event_time: input.eventTime,
        event_id: createHash("sha256").update(input.invoiceId).digest("hex"),
        action_source: "website",
        user_data: userData,
    }];

    try {
        const response = await fetch(
            `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${datasetId}/events`,
            {
                method: "POST",
                headers: { "content-type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ access_token: accessToken, data: JSON.stringify(data) }),
                cache: "no-store",
                signal: AbortSignal.timeout(4_000),
            },
        );
        if (!response.ok) {
            logger.warn({ invoiceId: input.invoiceId, status: response.status }, "Meta paid subscription event rejected");
        }
    } catch {
        // Measurement is best effort and must not make Stripe retry billing side effects.
        logger.warn({ invoiceId: input.invoiceId }, "Meta paid subscription event could not be sent");
    }
}
