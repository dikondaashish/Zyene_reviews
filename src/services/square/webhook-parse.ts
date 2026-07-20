export type ParsedSquarePaymentEvent = {
    merchantId: string;
    paymentId: string;
    eventType: string;
    eventId: string | null;
};

export type ParsedSquareRevokeEvent = {
    merchantId: string;
    eventId: string | null;
};

export type SquareWebhookPayload = {
    merchant_id?: string;
    type?: string;
    event_id?: string;
    data?: {
        type?: string;
        id?: string;
        object?: Record<string, unknown>;
    };
};

/** Only payment.created may trigger Phase 1 resolve (and later sends). */
export function shouldProcessSquarePaymentEvent(eventType: string): boolean {
    return eventType === "payment.created" || eventType === "CREATE";
}

export function parseSquareWebhook(payload: SquareWebhookPayload): {
    payment: ParsedSquarePaymentEvent | null;
    revoke: ParsedSquareRevokeEvent | null;
} {
    const type = payload.type ?? "";
    const merchantId = payload.merchant_id?.trim() || "";

    if (type === "oauth.authorization.revoked") {
        if (!merchantId) return { payment: null, revoke: null };
        return {
            payment: null,
            revoke: { merchantId, eventId: payload.event_id ?? null },
        };
    }

    if (type === "payment.created" || type === "payment.updated") {
        const paymentId = extractPaymentId(payload);
        if (!merchantId || !paymentId) return { payment: null, revoke: null };
        return {
            payment: {
                merchantId,
                paymentId,
                eventType: type,
                eventId: payload.event_id ?? null,
            },
            revoke: null,
        };
    }

    return { payment: null, revoke: null };
}

function extractPaymentId(payload: SquareWebhookPayload): string | null {
    const fromDataId = payload.data?.id?.trim();
    if (fromDataId) return fromDataId;

    const payment = payload.data?.object?.payment;
    if (payment && typeof payment === "object" && !Array.isArray(payment)) {
        const id = (payment as { id?: unknown }).id;
        if (typeof id === "string" && id.trim()) return id.trim();
    }
    return null;
}
