import { afterEach, describe, expect, it, vi } from "vitest";

import {
    getSentryEnvironment,
    getSentryTracesSampleRate,
} from "@/lib/monitoring/sentry-init-options";

describe("Sentry init options", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("samples 10% of traces in production by default", () => {
        vi.stubEnv("VERCEL_ENV", "production");
        vi.stubEnv("SENTRY_TRACES_SAMPLE_RATE", "");
        expect(getSentryEnvironment()).toBe("production");
        expect(getSentryTracesSampleRate()).toBe(0.1);
    });

    it("honors an explicit SENTRY_TRACES_SAMPLE_RATE override", () => {
        vi.stubEnv("VERCEL_ENV", "production");
        vi.stubEnv("SENTRY_TRACES_SAMPLE_RATE", "0.25");
        expect(getSentryTracesSampleRate()).toBe(0.25);
    });
});
