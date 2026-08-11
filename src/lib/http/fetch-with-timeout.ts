/**
 * `fetch` with a deadline.
 *
 * Node's `fetch` has no default timeout: if an upstream accepts the connection
 * and then stalls, the request hangs until the serverless platform kills the
 * whole invocation. That turns one slow third party (Google, Yelp, Square,
 * Clover, a heartbeat endpoint) into a burned function slot and, on a cron or
 * Inngest path, a step that never reports.
 *
 * A caller that passes its own `signal` keeps it — this only fills the gap
 * where there was none.
 */

/** Enough for a slow third-party API, short enough to fail before the platform does. */
export const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

/** Non-critical fire-and-forget pings — never worth holding a request open for. */
export const HEARTBEAT_TIMEOUT_MS = 5_000;

export function fetchWithTimeout(
    input: string | URL | Request,
    init: RequestInit = {},
    timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
): Promise<Response> {
    if (init.signal) return fetch(input, init);
    return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
