/**
 * Shared Sentry.init options for client, server, and edge runtimes.
 * Keep sampling and environment consistent so alerts stay meaningful in prod.
 */
export function getSentryEnvironment(): string {
    return process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
}

export function getSentryTracesSampleRate(): number {
    const configured = process.env.SENTRY_TRACES_SAMPLE_RATE;
    if (configured !== undefined && configured !== "") {
        const parsed = Number(configured);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    const environment = getSentryEnvironment();
    return environment === "production" ? 0.1 : 1;
}

/** Session Replay sample rate for healthy sessions (client only). */
export function getSentryReplaysSessionSampleRate(): number {
    const configured = process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
    if (configured !== undefined && configured !== "") {
        const parsed = Number(configured);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return getSentryEnvironment() === "production" ? 0.05 : 0;
}

/** Always capture a replay when an error is sent (client only). */
export function getSentryReplaysOnErrorSampleRate(): number {
    const configured = process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
    if (configured !== undefined && configured !== "") {
        const parsed = Number(configured);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return 1;
}

/**
 * Local `next dev` stays out of the shared project: HMR, stale Turbopack manifests
 * and half-edited files otherwise land next to real production issues.
 * Set NEXT_PUBLIC_SENTRY_ENABLE_DEV=true to test Sentry wiring locally.
 */
export function isSentryEnabled(): boolean {
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV === "true") return true;
    return process.env.NODE_ENV !== "development";
}

export function getSentryBaseInitOptions() {
    return {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        enabled: isSentryEnabled(),
        environment: getSentryEnvironment(),
        tracesSampleRate: getSentryTracesSampleRate(),
        debug: false,
    };
}
