
export type GoogleServiceErrorKind =
    | "api_disabled"
    | "access_pending"
    | "permission_denied"
    | "unverified_location"
    | "invalid_argument"
    | "rate_limited"
    | "server_error"
    | "other";

export interface GoogleServiceError extends Error {
    apiName: string;
    statusCode: number;
    kind: GoogleServiceErrorKind;
    googleStatus?: string;
    googleReason?: string;
}

interface GoogleErrorPayload {
    error?: {
        message?: string;
        status?: string;
        details?: Array<{ reason?: string }>;
    };
}

function parseGoogleErrorBody(body: string): {
    googleMessage?: string;
    googleStatus?: string;
    googleReason?: string;
} {
    try {
        const payload = JSON.parse(body) as GoogleErrorPayload;
        return {
            googleMessage: payload.error?.message,
            googleStatus: payload.error?.status,
            googleReason: payload.error?.details?.find((detail) => detail.reason)?.reason,
        };
    } catch {
        return {};
    }
}

function classifyGoogleServiceError(
    statusCode: number,
    googleStatus: string | undefined,
    googleReason: string | undefined,
    googleMessage: string
): GoogleServiceErrorKind {
    const apiDisabled =
        googleReason === "SERVICE_DISABLED" ||
        /service_disabled|has not been used|not been used|is disabled/i.test(googleMessage);
    if (apiDisabled) return "api_disabled";

    const accessPending =
        statusCode === 403 &&
        (googleReason === "RESOURCE_EXHAUSTED" ||
            /quota of 0|request.*(?:GBP|Business Profile).*access|access.*not been granted/i.test(
                googleMessage
            ));
    if (accessPending) return "access_pending";
    if (statusCode === 403 || googleStatus === "PERMISSION_DENIED") return "permission_denied";

    // Google returns 400 INVALID_ARGUMENT for a location the merchant has not
    // verified yet. That is a customer state, not a malformed request, so it is
    // classified separately from genuine argument errors.
    const unverifiedLocation =
        googleReason === "UNVERIFIED_LOCATION" || /unverified location/i.test(googleMessage);
    if (unverifiedLocation) return "unverified_location";

    if (statusCode === 400 || googleStatus === "INVALID_ARGUMENT") return "invalid_argument";
    if (statusCode === 429 || googleStatus === "RESOURCE_EXHAUSTED") return "rate_limited";
    if (statusCode >= 500) return "server_error";
    return "other";
}

export function createGoogleServiceError(
    apiName: string,
    statusCode: number,
    body: string
): GoogleServiceError {
    const { googleMessage = "", googleStatus, googleReason } = parseGoogleErrorBody(body);
    const kind = classifyGoogleServiceError(
        statusCode,
        googleStatus,
        googleReason,
        googleMessage || body
    );

    let message = `${apiName} request failed (${statusCode}${googleStatus ? ` ${googleStatus}` : ""}).`;
    if (kind === "api_disabled") {
        message =
            `${apiName} is disabled for this Google Cloud project. Enable ${apiName}, wait a few minutes, ` +
            "then retry the sync.";
    } else if (kind === "access_pending") {
        message = `${apiName} access or quota is not approved for this Google Cloud project.`;
    } else if (kind === "permission_denied") {
        message =
            `${apiName} denied access to this location. Confirm the Google account still manages it ` +
            "and reconnect Google if permissions changed.";
    } else if (kind === "unverified_location") {
        message =
            `${apiName} requires a verified Google Business Profile location. Complete Google's ` +
            "verification for this listing, then retry the sync.";
    }

    const error = new Error(message) as GoogleServiceError;
    error.name = "GoogleServiceError";
    error.apiName = apiName;
    error.statusCode = statusCode;
    error.kind = kind;
    error.googleStatus = googleStatus;
    error.googleReason = googleReason;
    return error;
}

export function isGoogleServiceError(error: unknown): error is GoogleServiceError {
    return (
        error instanceof Error &&
        error.name === "GoogleServiceError" &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
    );
}

export function isGoogleConfigurationError(error: unknown): error is GoogleServiceError {
    return isGoogleServiceError(error) && ["api_disabled", "access_pending"].includes(error.kind);
}

/**
 * Conditions owned by the customer's Google account, not by our code: the
 * listing is unverified, or the connected account no longer manages it.
 *
 * These recur on every sync cycle until the merchant acts, so paging on them
 * buries real faults. Callers log them and surface the message to the customer
 * instead of reporting to Sentry.
 */
export function isGoogleAccountStateError(error: unknown): error is GoogleServiceError {
    return (
        isGoogleServiceError(error) &&
        ["permission_denied", "unverified_location"].includes(error.kind)
    );
}

/** True when the failure is ours to fix or investigate — i.e. worth an alert. */
export function isGoogleActionableFault(error: unknown): boolean {
    return !isGoogleConfigurationError(error) && !isGoogleAccountStateError(error);
}
