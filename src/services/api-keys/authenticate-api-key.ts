import type { ApiKeyScope } from "@/lib/api-keys/scopes";
import {
    authenticateApiKeyRequest,
    type ApiKeyAuthentication,
    type StoredApiKey,
} from "@/lib/api-keys/authenticate";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { redis } from "@/lib/db/redis";

type StoredKeyRow = {
    id: string;
    business_id: string | null;
    scopes: string[];
    rate_limit_per_minute: number;
    expires_at: string | null;
    revoked_at: string | null;
};

async function findByHash(keyHash: string): Promise<StoredApiKey | null> {
    const result = (await createAdminClient()
        .from("aeo_public_api_keys" as never)
        .select(
            "id, business_id, scopes, rate_limit_per_minute, expires_at, revoked_at" as never,
        )
        .eq("key_hash" as never, keyHash as never)
        .maybeSingle()) as unknown as { data: StoredKeyRow | null; error: unknown };

    if (result.error) throw new Error("API key lookup failed");
    if (!result.data?.business_id) return null;
    return {
        id: result.data.id,
        businessId: result.data.business_id,
        scopes: result.data.scopes,
        rateLimitPerMinute: result.data.rate_limit_per_minute,
        expiresAt: result.data.expires_at,
        revokedAt: result.data.revoked_at,
    };
}

async function consumeRateLimit(
    keyId: string,
    limitPerMinute: number,
): Promise<"allowed" | "limited" | "unavailable"> {
    try {
        const minute = Math.floor(Date.now() / 60_000);
        const bucket = `api-key:${keyId}:${minute}`;
        const count = await redis.incr(bucket);
        if (count === 1) await redis.expire(bucket, 70);
        return count <= limitPerMinute ? "allowed" : "limited";
    } catch {
        return "unavailable";
    }
}

async function markUsed(keyId: string): Promise<void> {
    await createAdminClient()
        .from("aeo_public_api_keys" as never)
        .update({ last_used_at: new Date().toISOString() } as never)
        .eq("id" as never, keyId as never);
}

export async function authenticateStoredApiKey(
    request: Request,
    requiredScope: ApiKeyScope,
    options?: { allowXApiKey?: boolean },
): Promise<ApiKeyAuthentication> {
    return authenticateApiKeyRequest(
        request,
        requiredScope,
        { findByHash, consumeRateLimit, markUsed },
        { allowXApiKey: options?.allowXApiKey, rejectUrlKey: true },
    );
}
