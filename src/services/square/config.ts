/**
 * Square sandbox/production env helpers.
 * Optional — routes return a clear error if unset (do not throw at import).
 */
import { getAppBaseUrl } from "@/config/env";

export type SquareEnvironment = "sandbox" | "production";

export function getSquareEnvironment(): SquareEnvironment {
    const raw = (process.env.SQUARE_ENV || "sandbox").toLowerCase();
    return raw === "production" ? "production" : "sandbox";
}

export function getSquareApplicationId(): string | null {
    return process.env.SQUARE_APPLICATION_ID?.trim() || null;
}

export function getSquareApplicationSecret(): string | null {
    return process.env.SQUARE_APPLICATION_SECRET?.trim() || null;
}

/** Signature key from Developer Console → Webhooks subscription */
export function getSquareWebhookSignatureKey(): string | null {
    return process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() || null;
}

export function getSquareConnectBaseUrl(env = getSquareEnvironment()): string {
    return env === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";
}

export function getSquareOAuthRedirectUri(): string {
    return `${getAppBaseUrl()}/api/integrations/square/callback`;
}

/** Must match the notification URL registered on the Square webhook subscription. */
export function getSquareWebhookNotificationUrl(): string {
    return (
        process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() ||
        `${getAppBaseUrl()}/api/webhooks/square`
    );
}

/**
 * Application Secret looks like `sandbox-sq0csb-…` / `sq0csp-…`.
 * Values starting with `EAAA` are access tokens — a common mix-up that breaks ObtainToken.
 */
export function squareApplicationSecretLooksValid(
    secret = getSquareApplicationSecret(),
): boolean {
    if (!secret) return false;
    if (secret.startsWith("EAAA")) return false;
    return /^(sandbox-)?sq0cs[pb]-/.test(secret);
}

export function isSquareConfigured(): boolean {
    const secret = getSquareApplicationSecret();
    return Boolean(
        getSquareApplicationId() && secret && squareApplicationSecretLooksValid(secret),
    );
}

/** Scopes requested at authorize time (not dashboard checkboxes). */
export const SQUARE_OAUTH_SCOPES = [
    "PAYMENTS_READ",
    "CUSTOMERS_READ",
    "MERCHANT_PROFILE_READ",
] as const;
