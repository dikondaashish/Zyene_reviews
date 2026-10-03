import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
    filterServerSentryEvent,
    isAbortError,
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
});
