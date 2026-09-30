import { describe, expect, it } from "vitest";
import { Ratelimit as UpstashRatelimit, type RatelimitConfig } from "@upstash/ratelimit";
import { Ratelimit } from "@/lib/auth/fail-closed-rate-limit";

const pendingRedis = {
    evalsha: () => new Promise<never>(() => {}),
    eval: () => new Promise<never>(() => {}),
} as unknown as RatelimitConfig["redis"];

describe("SDK-level fail-closed rate limits", () => {
    it("rejects the real SDK's success-on-timeout fallback", async () => {
        const config = { redis: pendingRedis, limiter: UpstashRatelimit.fixedWindow(1, "1 m"), timeout: 5 };
        expect(await new UpstashRatelimit(config).limit("synthetic")).toMatchObject({ success: true, reason: "timeout" });
        await expect(new Ratelimit(config).limit("synthetic")).rejects.toThrow("storage timed out");
    });
    it("preserves genuine allows and denies from the SDK", async () => {
        const redis = { evalsha: async () => [1, 1], eval: async () => [1, 1] } as unknown as RatelimitConfig["redis"];
        const limit = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(1, "1 m"), analytics: false });
        expect((await limit.limit("synthetic")).success).toBe(true);
        const denied = new Ratelimit({ redis: { evalsha: async () => [2, 1] } as unknown as RatelimitConfig["redis"],
            limiter: Ratelimit.fixedWindow(1, "1 m"), analytics: false });
        expect((await denied.limit("synthetic")).success).toBe(false);
    });
});
