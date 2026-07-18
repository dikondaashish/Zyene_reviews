export type CloverWebhookUpdate = {
    objectId: string;
    type: string;
    ts: number;
};

export type CloverWebhookPayload = {
    appId?: string;
    merchants?: Record<string, CloverWebhookUpdate[]>;
    verificationCode?: string;
};

export type ParsedPaymentEvent = {
    merchantId: string;
    paymentId: string;
    eventType: string;
    ts: number;
};

/** Extract payment IDs from Clover webhook body (objectId like "P:ABC123"). */
export function parseCloverPaymentEvents(payload: CloverWebhookPayload): ParsedPaymentEvent[] {
    const out: ParsedPaymentEvent[] = [];
    const merchants = payload.merchants ?? {};
    for (const [merchantId, updates] of Object.entries(merchants)) {
        for (const update of updates ?? []) {
            const objectId = update.objectId || "";
            if (!objectId.startsWith("P:")) continue;
            const paymentId = objectId.slice(2);
            if (!paymentId) continue;
            out.push({
                merchantId,
                paymentId,
                eventType: update.type || "UPDATE",
                ts: update.ts || Date.now(),
            });
        }
    }
    return out;
}

export function isCloverVerificationPayload(
    payload: CloverWebhookPayload,
): payload is { verificationCode: string } {
    return typeof payload.verificationCode === "string" && payload.verificationCode.length > 0;
}
