import type { ErrorEvent } from "@sentry/nextjs";

/** Next.js control-flow throws that are not application faults. */
const NEXT_CONTROL_FLOW_PATTERN =
    /^(?:NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;\d+)$/;

function eventTextCandidates(event: ErrorEvent): Array<string | undefined> {
    return [event.message, ...(event.exception?.values ?? []).map((exception) => exception.value)];
}

/**
 * Drop framework control-flow and aborted-request noise from server/edge events.
 * Client-only filters stay in sentry-client-filter.ts.
 */
export function isNextControlFlowError(event: ErrorEvent): boolean {
    const exceptions = event.exception?.values ?? [];
    if (
        exceptions.some(
            (exception) =>
                typeof exception.value === "string" && NEXT_CONTROL_FLOW_PATTERN.test(exception.value)
        )
    ) {
        return true;
    }

    return eventTextCandidates(event).some(
        (text) => typeof text === "string" && NEXT_CONTROL_FLOW_PATTERN.test(text)
    );
}

export function isAbortError(event: ErrorEvent): boolean {
    return (event.exception?.values ?? []).some(
        (exception) => exception.type === "AbortError" || exception.value === "AbortError"
    );
}

export function filterServerSentryEvent(event: ErrorEvent): ErrorEvent | null {
    const isNoise = isNextControlFlowError(event) || isAbortError(event);
    return isNoise ? null : event;
}
