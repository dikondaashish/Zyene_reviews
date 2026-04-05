/**
 * Centralized environment configuration.
 * All environment variables are validated at import time.
 * Import from `@/config/env` instead of using process.env directly.
 */

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}. ` +
                `Check your .env.local file or deployment environment.`
        );
    }
    return value;
}

function optional(name: string, fallback: string): string {
    return process.env[name] || fallback;
}

// --- Public (exposed to browser) ---

export const NEXT_PUBLIC_SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const NEXT_PUBLIC_APP_URL = optional(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
);
export const NEXT_PUBLIC_ROOT_DOMAIN = optional(
    "NEXT_PUBLIC_ROOT_DOMAIN",
    "localhost:3000"
);
export const NEXT_PUBLIC_APP_NAME = optional(
    "NEXT_PUBLIC_APP_NAME",
    "Zyene Reviews"
);

// --- Derived helpers ---

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const ROOT_DOMAIN = NEXT_PUBLIC_ROOT_DOMAIN;
export const PROTOCOL = ROOT_DOMAIN.includes("localhost") ? "http" : "https";
export const BASE_URL = `${PROTOCOL}://${ROOT_DOMAIN}`;

/**
 * Cookie domain: "localhost" for dev, ".yourdomain.com" for prod.
 */
export const COOKIE_DOMAIN = ROOT_DOMAIN.includes("localhost")
    ? "localhost"
    : `.${ROOT_DOMAIN}`;

// --- Server-only (lazy getters to avoid crashing during build) ---

export function getSupabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
}

export function getStripePriceIds() {
    return {
        starterMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "",
        starterYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID ?? "",
        proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
        proYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
    };
}

export function getGoogleCredentials() {
    return {
        clientId: required("GOOGLE_CLIENT_ID"),
        clientSecret: required("GOOGLE_CLIENT_SECRET"),
    };
}

export function getTwilioCredentials() {
    return {
        accountSid: required("TWILIO_ACCOUNT_SID"),
        authToken: required("TWILIO_AUTH_TOKEN"),
        phoneNumber: required("TWILIO_PHONE_NUMBER"),
    };
}

export function getResendApiKey() {
    return required("RESEND_API_KEY");
}

export function getCronSecret() {
    return required("CRON_SECRET");
}

export function getEncryptionKey() {
    return required("ENCRYPTION_KEY");
}

export function getGcpConfig() {
    return {
        projectId: optional("GCP_PROJECT_ID", "zyene-reviews"),
        region: optional("GCP_REGION", "us-central1"),
    };
}

export function getUpstashRedisConfig() {
    return {
        url: process.env.UPSTASH_REDIS_REST_URL ?? "",
        token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    };
}

export function getInngestKeys() {
    return {
        eventKey: process.env.INNGEST_EVENT_KEY ?? "",
        signingKey: process.env.INNGEST_SIGNING_KEY ?? "",
    };
}

export function getGoogleGbpWebhookSecret() {
    return required("GOOGLE_GBP_WEBHOOK_SECRET");
}
