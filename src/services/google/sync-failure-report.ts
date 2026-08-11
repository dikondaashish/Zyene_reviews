/**
 * Reporting policy for Google sync failures.
 *
 * Split from api-error.ts so the error *model* (classification, type guards)
 * stays free of logging and Sentry concerns.
 */
import * as Sentry from "@sentry/nextjs";

import { logger } from "@/lib/logger";

import {
    isGoogleAccountStateError,
    isGoogleConfigurationError,
    isGoogleServiceError,
} from "./api-error";

/**
 * Single triage point for a failed Google sync.
 *
 * Configuration problems (ours) and account-state problems (the customer's) are
 * logged and left for the UI to surface; only genuine faults reach Sentry, so
 * alerts stay meaningful. Returns the message for the caller's result object.
 */
export function reportGoogleSyncFailure(logPrefix: string, error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (isGoogleConfigurationError(error)) {
        logger.warn(
            {
                api: error.apiName,
                statusCode: error.statusCode,
                googleStatus: error.googleStatus,
                googleReason: error.googleReason,
            },
            `${logPrefix} Google API configuration required`
        );
        return message;
    }

    if (isGoogleAccountStateError(error)) {
        logger.warn(
            {
                api: error.apiName,
                statusCode: error.statusCode,
                googleStatus: error.googleStatus,
                googleReason: error.googleReason,
                kind: error.kind,
            },
            `${logPrefix} Google account state blocks sync — customer action required`
        );
        return message;
    }

    logger.error({ err: message }, `${logPrefix} sync failed`);
    captureGoogleServiceException(error);
    return message;
}

export function captureGoogleServiceException(error: unknown): void {
    if (!isGoogleServiceError(error)) {
        Sentry.captureException(error);
        return;
    }
    Sentry.withScope((scope) => {
        scope.setTag("google.api", error.apiName);
        scope.setTag("google.error_kind", error.kind);
        scope.setTag("google.http_status", String(error.statusCode));
        if (error.googleStatus) scope.setTag("google.rpc_status", error.googleStatus);
        if (error.googleReason) scope.setTag("google.error_reason", error.googleReason);
        Sentry.captureException(error);
    });
}
