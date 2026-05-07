import { redis } from "@/lib/db/redis";

/**
 * Acquire a short-lived lock to prevent duplicate work.
 * Uses Upstash Redis `SET key value NX EX ttlSeconds`.
 */
export async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const value = `${Date.now()}:${Math.random().toString(16).slice(2)}`;
    const res = await redis.set(key, value, { nx: true, ex: ttlSeconds });
    return res === "OK";
}

export async function releaseLock(key: string) {
    try {
        await redis.del(key);
    } catch {
        // best-effort
    }
}

