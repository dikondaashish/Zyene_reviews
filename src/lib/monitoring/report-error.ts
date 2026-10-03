/**
 * Central place to report unexpected failures to Sentry + logs.
 * Prefer this over ad-hoc captureException so tags stay consistent.
 */
import * as Sentry from "@sentry/nextjs";

import { logger } from "@/lib/logger";

export function reportError(
    error: unknown,
    context?: {
        logMessage?: string;
        tags?: Record<string, string>;
        extra?: Record<string, unknown>;
    }
): void {
    const message = context?.logMessage ?? (error instanceof Error ? error.message : String(error));
    logger.error({ err: error, ...context?.extra }, message);

    Sentry.withScope((scope) => {
        if (context?.tags) {
            for (const [key, value] of Object.entries(context.tags)) {
                scope.setTag(key, value);
            }
        }
        if (context?.extra) {
            scope.setExtras(context.extra);
        }
        Sentry.captureException(error);
    });
}
