import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
    filterClientSentryEvent,
    isCefSharpCrawlerError,
    isInjectedMetaMaskError,
    isStaleServerActionError,
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

    it("drops the stale Server Action error a deploy causes in already-open tabs", () => {
        const event = errorEvent(
            'Server Action "40d5eab709e76ea195dfff9020aca8ad2c7b2f8355" was not found on the server. Read more: https://nextjs.org/docs/messages/failed-to-find-server-action',
            "app:///_next/static/chunks/2086-a2f79aec4475002e.js",
        );

        expect(isStaleServerActionError(event)).toBe(true);
        expect(filterClientSentryEvent(event)).toBeNull();
    });

    it("drops the stale Server Action error when reported only as a top-level message", () => {
        const event: ErrorEvent = {
            type: undefined,
            message: 'Server Action "abc123" was not found on the server.',
        };

        expect(filterClientSentryEvent(event)).toBeNull();
    });

    it("keeps other Server Action failures that are not the stale-id case", () => {
        const event = errorEvent(
            "An error occurred in the Server Components render",
            "app:///_next/static/chunks/2086.js",
        );

        expect(isStaleServerActionError(event)).toBe(false);
        expect(filterClientSentryEvent(event)).toBe(event);
    });
});
