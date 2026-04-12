/**
 * POST /api/billing/checkout returns `apiOk({ url?, switched?, requestId })` → body is `{ success: true, data: {...} }`.
 * Normalize so clients always read the payload correctly.
 */
export type CheckoutPayload = {
    switched?: boolean;
    url?: string;
    requestId?: string;
};

export function parseBillingCheckoutResponse(json: unknown): {
    ok: boolean;
    error?: string;
    payload?: CheckoutPayload;
} {
    if (typeof json !== "object" || json === null) {
        return { ok: false, error: "Invalid response" };
    }
    const o = json as Record<string, unknown>;
    if (o.success !== true) {
        const err = o.error;
        return {
            ok: false,
            error: typeof err === "string" ? err : o.success === false ? "Request failed" : "Invalid response",
        };
    }
    const inner = o.data;
    const payload: CheckoutPayload =
        inner && typeof inner === "object"
            ? (inner as CheckoutPayload)
            : (o as CheckoutPayload);
    return { ok: true, payload };
}
