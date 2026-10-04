import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
    filterServerSentryEvent,
    isAbortError,
    isExpectedGoogleSetupNoise,
    isNextControlFlowError,
} from "@/lib/monitoring/sentry-server-filter";

describe("Sentry server event filtering", () => {
    it("drops Next.js redirect / not-found control-flow errors", () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: { values: [{ value: "NEXT_REDIRECT" }] },
        };
        expect(isNextControlFlowError(event)).toBe(true);
        expect(filterServerSentryEvent(event)).toBeNull();
    });

    it("drops AbortError noise from cancelled requests", () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: { values: [{ type: "AbortError", value: "The operation was aborted" }] },
        };
        expect(isAbortError(event)).toBe(true);
        expect(filterServerSentryEvent(event)).toBeNull();
    });

    it("keeps real application errors", () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: { values: [{ type: "Error", value: "Sync failed" }] },
        };
        expect(filterServerSentryEvent(event)).toBe(event);
    });

    it("drops expected Google setup and notification-registration noise", () => {
        const noLocations: ErrorEvent = {
            type: undefined,
            exception: { values: [{ type: "Error", value: "No Locations found" }] },
        };
        const notify404: ErrorEvent = {
            type: undefined,
            exception: {
                values: [{ type: "Error", value: "Failed to register notifications: 404 Not Found" }],
            },
        };
        expect(isExpectedGoogleSetupNoise(noLocations)).toBe(true);
        expect(filterServerSentryEvent(noLocations)).toBeNull();
        expect(filterServerSentryEvent(notify404)).toBeNull();
    });
});

