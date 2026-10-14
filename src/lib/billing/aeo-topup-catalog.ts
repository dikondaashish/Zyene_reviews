/**
 * "Add balance" options for prepaid AEO tests. Shared by the dialog (client)
 * and the checkout API (server), so both enforce the same limits.
 */
export const AEO_TOPUP_CHECKOUT_KIND = "aeo_credit_topup";

/** One test = one successful answer from one AI engine. Matches ONE_TEST_MICRO_USD. */
export const AEO_TEST_PRICE_USD = 2.5;

export const AEO_TOPUP_PACKS_USD = [10, 25, 50] as const;
export const AEO_TOPUP_MIN_USD = 10;
export const AEO_TOPUP_MAX_USD = 500;

export function isValidTopupAmount(amountUsd: number): boolean {
    return Number.isInteger(amountUsd) && amountUsd >= AEO_TOPUP_MIN_USD && amountUsd <= AEO_TOPUP_MAX_USD;
}

export function testsForAmount(amountUsd: number): number {
    return Math.floor(amountUsd / AEO_TEST_PRICE_USD);
}

/** Whole dollars when exact, cents otherwise: $5, $2.50. */
export function formatUsd(amountUsd: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: Number.isInteger(amountUsd) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amountUsd);
}

export function microUsdToUsd(microUsd: number): number {
    return microUsd / 1_000_000;
}
