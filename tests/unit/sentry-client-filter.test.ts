import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
    filterClientSentryEvent,
    isCefSharpCrawlerError,
    isInjectedMetaMaskError,
} from "../../src/lib/monitoring/sentry-client-filter";

function errorEvent(message: string, filename: string): ErrorEvent {
    return {
        type: undefined,
        exception: {
            values: [
                {
                    value: message,
                    stacktrace: { frames: [{ filename }] },
                },
            ],
        },
    };
}

describe("Sentry client event filtering", () => {
    it("drops the CefSharp crawler rejection reported on an expired auth link", () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: {
                values: [
                    {
                        value: "Non-Error promise rejection captured with value: Object Not Found Matching Id:1, MethodName:update, ParamCount:4",
                    },
                ],
            },
        };

        expect(isCefSharpCrawlerError(event)).toBe(true);
        expect(filterClientSentryEvent(event)).toBeNull();
    });

    it("keeps application errors that only resemble the CefSharp signature", () => {
        const event: ErrorEvent = {
            type: undefined,
            message: "Object Not Found Matching Id:1, MethodName:updateProfile, ParamCount:4",
        };

        expect(filterClientSentryEvent(event)).toBe(event);
    });

    it("drops the MetaMask injected error reported on signup", () => {
        const event = errorEvent("Failed to connect to MetaMask", "app:///scripts/inpage.js");

        expect(isInjectedMetaMaskError(event)).toBe(true);
        expect(filterClientSentryEvent(event)).toBeNull();
    });

    it("drops the linked MetaMask extension-not-found error", () => {
        const event = errorEvent("MetaMask extension not found", "chrome-extension://wallet/inpage.js");

        expect(filterClientSentryEvent(event)).toBeNull();
    });

    it("keeps a MetaMask-like application error without an extension frame", () => {
        const event = errorEvent("Failed to connect to MetaMask", "app:///src/app/signup.tsx");

        expect(filterClientSentryEvent(event)).toBe(event);
    });

    it("keeps unrelated errors even when an injected script appears in the stack", () => {
        const event = errorEvent("Google sign-in failed", "app:///scripts/inpage.js");

        expect(filterClientSentryEvent(event)).toBe(event);
    });
});
