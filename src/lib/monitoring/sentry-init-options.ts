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

export function getSentryBaseInitOptions() {
    return {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: getSentryEnvironment(),
        tracesSampleRate: getSentryTracesSampleRate(),
        debug: false,
    };
}
