import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("signup analytics", () => {
    it("records request and registration as separate, deduplicated steps without personal data", async () => {
        vi.resetModules();
        const values = new Map<string, string>();
        const dataLayer: unknown[] = [];
        vi.stubGlobal("window", { dataLayer, sessionStorage: {
            getItem: (key: string) => values.get(key),
            setItem: (key: string, value: string) => values.set(key, value),
        } });
        const { trackSignupEvent } = await import("@/lib/analytics/signup-events");
        trackSignupEvent("signup_started", "email");
        trackSignupEvent("signup_started", "email");
        trackSignupEvent("signup_verification_requested", "email");
        trackSignupEvent("signup_complete", "email");
        trackSignupEvent("signup_complete", "email");
        expect(dataLayer).toEqual([
            { event: "signup_started", method: "email" },
            { event: "signup_verification_requested", method: "email" },
            { event: "signup_complete", method: "email" },
        ]);
    });

    it("cannot break signup when browser storage is blocked", async () => {
        vi.resetModules();
        const dataLayer: unknown[] = [];
        vi.stubGlobal("window", { dataLayer, sessionStorage: {
            getItem: () => { throw new Error("storage blocked"); },
            setItem: () => { throw new Error("storage blocked"); },
        } });
        const { trackSignupEvent } = await import("@/lib/analytics/signup-events");
        expect(() => trackSignupEvent("signup_complete", "google")).not.toThrow();
        trackSignupEvent("signup_complete", "google");
        expect(dataLayer).toEqual([{ event: "signup_complete", method: "google" }]);
    });
});
