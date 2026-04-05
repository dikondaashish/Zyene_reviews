import pino from "pino";

/**
 * Structured logger using Pino.
 * Use this instead of console.log/error/warn throughout the codebase.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info({ platformId }, "Sync completed");
 *   logger.error({ err, route: "cron-sync" }, "Sync failed");
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    ...(process.env.NODE_ENV !== "production" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
            },
        },
    }),
});

/**
 * Create a child logger with a fixed context (e.g., per-module or per-request).
 *
 * Usage:
 *   const log = createLogger("google-sync");
 *   log.info("Starting sync");
 */
export function createLogger(module: string) {
    return logger.child({ module });
}

/**
 * Create a request-scoped logger with a unique correlation ID.
 * Use this in API routes to trace a request across all log entries.
 *
 * Usage:
 *   const log = createRequestLogger("POST /api/reviews");
 *   log.info({ userId }, "Processing request");
 *   // All logs will include { requestId: "abc-123", route: "POST /api/reviews" }
 */
export function createRequestLogger(route: string) {
    const requestId = crypto.randomUUID();
    return {
        logger: logger.child({ requestId, route }),
        requestId,
    };
}
