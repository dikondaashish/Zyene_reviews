import type { ErrorEvent } from "@sentry/nextjs";

const METAMASK_ERROR_MESSAGES = new Set([
    "failed to connect to metamask",
    "metamask extension not found",
]);

const EXTENSION_FRAME_PATTERN = /^(?:app:\/\/\/scripts\/inpage\.js|chrome-extension:\/\/|moz-extension:\/\/|safari(?:-web)?-extension:\/\/)/i;
const CEFSHARP_CRAWLER_ERROR_PATTERN = /^(?:Non-Error promise rejection captured with value: )?Object Not Found Matching Id:\d+, MethodName:update, ParamCount:\d+$/;
const STALE_SERVER_ACTION_PATTERN =
    /Server Action "[^"]+" was not found on the server/i;
/** Safari/Chrome/Firefox fetch failures when the network drops mid-request. */
const BROWSER_NETWORK_FETCH_PATTERN =
    /^(?:Load failed|Failed to fetch|NetworkError when attempting to fetch resource\.?|The Internet connection appears to be offline\.?)$/i;
const HYDRATION_MISMATCH_PATTERN =
    /Hydration failed because the server rendered HTML didn't match the client/i;

function isMetaMaskMessage(message: string | undefined): boolean {
    if (!message) return false;

    return METAMASK_ERROR_MESSAGES.has(message.trim().replace(/[.!]$/, "").toLowerCase());
}

/**
 * Detects the known MetaMask-injected error without hiding application errors.
 * Both a MetaMask-specific message and an extension-owned stack frame are required.
 */
export function isInjectedMetaMaskError(event: ErrorEvent): boolean {
    const exceptions = event.exception?.values ?? [];
    const hasMetaMaskMessage =
        isMetaMaskMessage(event.message) || exceptions.some((exception) => isMetaMaskMessage(exception.value));

    if (!hasMetaMaskMessage) return false;

    return exceptions.some((exception) =>
        exception.stacktrace?.frames?.some(
            (frame) => typeof frame.filename === "string" && EXTENSION_FRAME_PATTERN.test(frame.filename)
        )
    );
}

/**
 * Detects a Server Action id that no longer exists on the server.
 *
 * Next.js derives action ids from the build. When a deploy lands while someone
 * has a page open, their cached bundle posts an id the new build does not know,
 * and Next throws this. It is expected on every deploy, affects only tabs opened
 * before it, and clears on reload - so it is noise rather than a defect.
 *
 * Matched narrowly on Next's own wording plus the hex id, so a genuinely missing
 * action still surfaces through other error shapes.
 */
export function isStaleServerActionError(event: ErrorEvent): boolean {
    const candidates = [
        event.message,
        ...(event.exception?.values ?? []).map((exception) => exception.value),
    ];

    return candidates.some(
        (text) => typeof text === "string" && STALE_SERVER_ACTION_PATTERN.test(text)
    );
}

/** Detects the unactionable rejection emitted by CefSharp-based link scanners. */
export function isCefSharpCrawlerError(event: ErrorEvent): boolean {
    if (event.message && CEFSHARP_CRAWLER_ERROR_PATTERN.test(event.message)) return true;

    return (event.exception?.values ?? []).some(
        (exception) =>
            typeof exception.value === "string" && CEFSHARP_CRAWLER_ERROR_PATTERN.test(exception.value)
    );
}

function eventTextCandidates(event: ErrorEvent): Array<string | undefined> {
    return [event.message, ...(event.exception?.values ?? []).map((exception) => exception.value)];
}

/**
 * Browser-level fetch failures (often Mobile Safari "Load failed") with no useful
 * app stack. The UI already toasts these; paging on transient network drops is noise.
 */
export function isBrowserNetworkFetchError(event: ErrorEvent): boolean {
    const exceptions = event.exception?.values ?? [];
    const typeError =
        exceptions.length === 0 ||
        exceptions.every((exception) => !exception.type || exception.type === "TypeError");
    if (!typeError) return false;

    const hasNetworkMessage = eventTextCandidates(event).some(
        (text) => typeof text === "string" && BROWSER_NETWORK_FETCH_PATTERN.test(text.trim())
    );
    if (!hasNetworkMessage) return false;

    const frames = exceptions.flatMap((exception) => exception.stacktrace?.frames ?? []);
    // Keep events that clearly point at our app code.
    return !frames.some(
        (frame) =>
            typeof frame.filename === "string" &&
            /(?:^app:\/\/\/src\/|\/src\/|_next\/static\/chunks\/app\/)/.test(frame.filename)
    );
}

/**
 * React hydration mismatches from local/preview. Production hydration bugs stay.
 */
export function isDevelopmentHydrationMismatch(event: ErrorEvent): boolean {
    const environment = event.tags?.environment ?? event.environment;
    if (environment !== "development") return false;

    return eventTextCandidates(event).some(
        (text) => typeof text === "string" && HYDRATION_MISMATCH_PATTERN.test(text)
    );
}

export function filterClientSentryEvent(event: ErrorEvent): ErrorEvent | null {
    const isNoise =
        isInjectedMetaMaskError(event) ||
        isCefSharpCrawlerError(event) ||
        isStaleServerActionError(event) ||
        isBrowserNetworkFetchError(event) ||
        isDevelopmentHydrationMismatch(event);

    return isNoise ? null : event;
}
