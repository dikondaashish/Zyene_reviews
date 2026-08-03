import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isAuthorizedCronRequest } from "../../src/lib/cron/authorize-cron-request";

const originalSecret = process.env.CRON_SECRET;

beforeEach(() => {
    process.env.CRON_SECRET = "production-cron-secret";
});

afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
});

describe("isAuthorizedCronRequest", () => {
    it("accepts the configured bearer secret", () => {
        const request = new Request("https://example.com/api/cron/test", {
            headers: { Authorization: "Bearer production-cron-secret" },
        });
        expect(isAuthorizedCronRequest(request)).toBe(true);
    });

    it("rejects a spoofed Vercel cron header", () => {
        const request = new Request("https://example.com/api/cron/test", {
            headers: { "x-vercel-cron": "1" },
        });
        expect(isAuthorizedCronRequest(request)).toBe(false);
    });

    it("rejects missing and incorrect secrets", () => {
        expect(isAuthorizedCronRequest(new Request("https://example.com/api/cron/test"))).toBe(false);
        expect(
            isAuthorizedCronRequest(
                new Request("https://example.com/api/cron/test", {
                    headers: { Authorization: "Bearer wrong-secret" },
                })
            )
        ).toBe(false);
    });
});
