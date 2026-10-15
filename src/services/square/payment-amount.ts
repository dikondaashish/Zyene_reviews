/**
 * Square money is an integer in the currency's smallest unit (cents for USD).
 * Prefer total_money (includes tip), fall back to amount_money.
 */
export function extractSquarePaymentAmountCents(payment: unknown): number | null {
    const root = asRecord(payment);
    for (const key of ["total_money", "amount_money"] as const) {
        const amount = asRecord(root?.[key])?.amount;
        if (typeof amount === "number" && Number.isFinite(amount)) return Math.round(amount);
    }
    return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}
