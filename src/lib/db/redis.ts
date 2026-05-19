import { Redis } from "@upstash/redis";

function resolveRedisCredentials(): { url: string; token: string } {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

    if (process.env.VERCEL_ENV === "production" && (!url || !token)) {
        throw new Error(
            "[Redis] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production."
        );
    }

    return {
        url: url || "https://dummy-redis-url.upstash.io",
        token: token || "dummy_token",
    };
}

let redisInstance: Redis | undefined;

export function getRedisClient(): Redis {
    if (!redisInstance) {
        const { url, token } = resolveRedisCredentials();
        redisInstance = new Redis({ url, token });
    }
    return redisInstance;
}

/** Shared Upstash client (lazy-init so production builds without Redis env still compile). */
export const redis: Redis = new Proxy({} as Redis, {
    get(_target, prop) {
        const client = getRedisClient();
        const value = Reflect.get(client, prop, client) as unknown;
        return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
    },
});
