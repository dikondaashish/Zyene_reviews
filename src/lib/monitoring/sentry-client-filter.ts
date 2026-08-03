import type { ErrorEvent } from "@sentry/nextjs";

const METAMASK_ERROR_MESSAGES = new Set([
    "failed to connect to metamask",
    "metamask extension not found",
]);

const EXTENSION_FRAME_PATTERN = /^(?:app:\/\/\/scripts\/inpage\.js|chrome-extension:\/\/|moz-extension:\/\/|safari(?:-web)?-extension:\/\/)/i;

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

export function filterClientSentryEvent(event: ErrorEvent): ErrorEvent | null {
    return isInjectedMetaMaskError(event) ? null : event;
}
