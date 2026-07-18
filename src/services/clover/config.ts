/**
 * Clover sandbox/production env helpers.
 * Optional — routes return a clear error if unset (do not throw at import).
 */
import { getAppBaseUrl } from "@/config/env";

export type CloverEnvironment = "sandbox" | "production";

export function getCloverEnvironment(): CloverEnvironment {
    const raw = (process.env.CLOVER_ENV || "sandbox").toLowerCase();
    return raw === "production" ? "production" : "sandbox";
}

export function getCloverAppId(): string | null {
    return process.env.CLOVER_APP_ID?.trim() || null;
}

export function getCloverAppSecret(): string | null {
    return process.env.CLOVER_APP_SECRET?.trim() || null;
}

/** Shared secret from Clover App Settings → Webhooks → Clover Auth Code */
export function getCloverWebhookAuth(): string | null {
    return process.env.CLOVER_WEBHOOK_AUTH?.trim() || null;
}

export function getCloverAuthorizeBaseUrl(env = getCloverEnvironment()): string {
    return env === "production"
        ? "https://www.clover.com"
        : "https://sandbox.dev.clover.com";
}

export function getCloverApiBaseUrl(env = getCloverEnvironment()): string {
    return env === "production"
        ? "https://api.clover.com"
        : "https://apisandbox.dev.clover.com";
}

export function getCloverOAuthRedirectUri(): string {
    return `${getAppBaseUrl()}/api/integrations/clover/callback`;
}

export function isCloverConfigured(): boolean {
    return Boolean(getCloverAppId() && getCloverAppSecret());
}

/** Clover returns Unix seconds; JS Date expects ms. */
export function cloverUnixSecondsToIso(seconds: number | undefined | null): string | null {
    if (seconds == null || !Number.isFinite(seconds)) return null;
    return new Date(seconds * 1000).toISOString();
}
