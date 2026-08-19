import { createHash, randomBytes } from "node:crypto";

import type { ApiKeyScope } from "./scopes";

const KEY_PREFIX = "zy_live_";
const PREFIX_RANDOM_CHARACTERS = 6;

export type ApiKeyStorageMaterial = {
    keyHash: string;
    keyPrefix: string;
};

export type PublicApiKey = {
    id: string;
    name: string;
    keyPrefix: string;
    scopes: ApiKeyScope[];
    rateLimitPerMinute: number;
    lastUsedAt: string | null;
    revokedAt: string | null;
    createdAt: string;
};

type StoredPublicFields = {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    rate_limit_per_minute: number;
    last_used_at: string | null;
    revoked_at: string | null;
    created_at: string;
};

export function hashApiKey(apiKey: string): string {
    return createHash("sha256").update(apiKey, "utf8").digest("hex");
}

export function createApiKeyMaterial(): {
    secret: string;
    storage: ApiKeyStorageMaterial;
} {
    const secret = `${KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
    return {
        secret,
        storage: {
            keyHash: hashApiKey(secret),
            keyPrefix: secret.slice(0, KEY_PREFIX.length + PREFIX_RANDOM_CHARACTERS),
        },
    };
}

export function toPublicApiKey(row: StoredPublicFields): PublicApiKey {
    return {
        id: row.id,
        name: row.name,
        keyPrefix: row.key_prefix,
        scopes: row.scopes as ApiKeyScope[],
        rateLimitPerMinute: row.rate_limit_per_minute,
        lastUsedAt: row.last_used_at,
        revokedAt: row.revoked_at,
        createdAt: row.created_at,
    };
}
