import { createHash } from "node:crypto";
import { redis } from "@/lib/db/redis";
import { checkLimit } from "@/lib/stripe/check-limits";
import { MONTHLY_CHANNEL_RESERVATION_SCRIPT } from "@/lib/stripe/monthly-channel-reservation-script";

/** Caller must derive organizationId from an authorized, live business row. */
export async function reserveChannelUsage(
    organizationId: string, channels: ("sms" | "email")[], claimId: string,
): Promise<boolean> {
    const unique = [...new Set(channels)].sort();
    if (!organizationId || !claimId || unique.length === 0) return false;
    // Read current plan/usage on every attempt, including an idempotent retry.
    const limits = await Promise.all(unique.map(channel => checkLimit(organizationId, `${channel}_requests`)));
    if (limits.some(limit => !Number.isSafeInteger(limit.current) || limit.current < 0 ||
        (limit.max !== -1 && (!Number.isSafeInteger(limit.max) || limit.max <= 0)))) return false;
    const month = new Date().toISOString().slice(0, 7);
    const prefix = `outbound-usage:{${organizationId}}:${month}`;
    const claim = createHash("sha256").update(`${claimId}:${unique.join(",")}`).digest("hex");
    const keys = [...unique.map(channel => `${prefix}:${channel}`), `${prefix}:claim:${claim}`];
    const values = limits.flatMap(limit => [limit.current, limit.max]);
    // Failed work retains its reservation, as request records already do.
    return (await redis.eval<number[], number>(MONTHLY_CHANNEL_RESERVATION_SCRIPT, keys, [...values, 45 * 86400])) === 1;
}
