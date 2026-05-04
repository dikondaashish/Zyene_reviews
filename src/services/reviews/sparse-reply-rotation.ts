const KEY_PREFIX = "sparse_reply_tpl:v2:biz";
const TTL_SECONDS = 14 * 24 * 60 * 60;

function randomIndex(exclusiveMax: number): number {
    if (exclusiveMax <= 0) return 0;
    return Math.floor(Math.random() * exclusiveMax);
}

/**
 * How many recent template indices to remember in Redis (~75% of pool size, within ~70–80%).
 * Capped below poolLength so at least one index can still be “fresh.”
 */
export function sparseRotationHistoryCap(poolLength: number): number {
    if (poolLength <= 1) return 1;
    const pct = 0.75;
    const target = Math.round(poolLength * pct);
    return Math.max(1, Math.min(poolLength - 1, target));
}

/**
 * Picks a **random** template index for star-only / sparse positive replies.
 * When Redis + `rotationScope` (business id) are set, picks uniformly among templates **not**
 * in the recent history for that location + tone, then records the choice (reduces back-to-back repeats).
 * Without Redis or scope: uniform random over the full pool.
 */
export async function pickSparseTemplateIndex(args: {
    /** `business_id` for the location (not organization id). */
    rotationScope: string | null | undefined;
    tone: string;
    poolLength: number;
}): Promise<number> {
    const { rotationScope, tone, poolLength } = args;
    if (poolLength <= 0) return 0;

    const scope = (rotationScope || "").trim();
    if (!scope) {
        return randomIndex(poolLength);
    }

    const historyLen = sparseRotationHistoryCap(poolLength);
    const key = `${KEY_PREFIX}:${scope}:${tone}`;

    try {
        const { redis } = await import("@/lib/db/redis");
        const raw = (await redis.lrange<string>(key, -historyLen, -1)) ?? [];
        const recent = new Set<number>();
        for (const item of raw) {
            const n = parseInt(String(item), 10);
            if (!Number.isNaN(n) && n >= 0 && n < poolLength) recent.add(n);
        }

        const allowed: number[] = [];
        for (let i = 0; i < poolLength; i++) {
            if (!recent.has(i)) allowed.push(i);
        }
        const pickFrom = allowed.length > 0 ? allowed : Array.from({ length: poolLength }, (_, i) => i);
        const choice = pickFrom[randomIndex(pickFrom.length)]!;

        await redis.rpush(key, String(choice));
        await redis.ltrim(key, -historyLen, -1);
        await redis.expire(key, TTL_SECONDS);
        return choice;
    } catch {
        return randomIndex(poolLength);
    }
}
