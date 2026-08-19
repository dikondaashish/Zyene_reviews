import { describe, expect, it, vi } from "vitest";

import {
    authenticateApiKeyRequest,
    type ApiKeyAuthDependencies,
    type StoredApiKey,
} from "@/lib/api-keys/authenticate";
import {
    createApiKeyMaterial,
    toPublicApiKey,
} from "@/lib/api-keys/credentials";
import { canManageApiKeys } from "@/lib/api-keys/scopes";
import { performApiKeyRotation } from "@/lib/api-keys/rotation";

const secret = "zy_live_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";
const actorId = "33333333-3333-4333-8333-333333333333";

function storedKey(overrides: Partial<StoredApiKey> = {}): StoredApiKey {
    return {
        id: "11111111-1111-4111-8111-111111111111",
        businessId: "22222222-2222-4222-8222-222222222222",
        scopes: ["review_requests:write"],
        rateLimitPerMinute: 60,
        expiresAt: null,
        revokedAt: null,
        ...overrides,
    };
}

function dependencies(key: StoredApiKey | null): ApiKeyAuthDependencies {
    return {
        findByHash: vi.fn().mockResolvedValue(key),
        consumeRateLimit: vi.fn().mockResolvedValue("allowed"),
        markUsed: vi.fn().mockResolvedValue(undefined),
    };
}

describe("API-key authentication", () => {
    it("accepts a valid bearer key and enforces the requested scope", async () => {
        const deps = dependencies(storedKey());
        const result = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "review_requests:write",
            deps,
        );

        expect(result).toMatchObject({ ok: true, businessId: storedKey().businessId });
        expect(deps.findByHash).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/));
        expect(deps.markUsed).toHaveBeenCalledWith(storedKey().id);
    });

    it("rejects missing, invalid, and revoked keys", async () => {
        const missing = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic"),
            "review_requests:write",
            dependencies(storedKey()),
        );
        const invalid = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "review_requests:write",
            dependencies(null),
        );
        const revoked = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "review_requests:write",
            dependencies(storedKey({ revokedAt: new Date().toISOString() })),
        );

        expect(missing).toMatchObject({ ok: false, status: 401 });
        expect(invalid).toMatchObject({ ok: false, status: 401 });
        expect(revoked).toMatchObject({ ok: false, status: 401 });
    });

    it("rejects URL keys even when a valid bearer header is also present", async () => {
        const deps = dependencies(storedKey());
        const result = await authenticateApiKeyRequest(
            new Request(`https://app.example.com/api/webhooks/generic?key=${secret}`, {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "review_requests:write",
            deps,
        );

        expect(result).toMatchObject({ ok: false, status: 400, code: "url_key_rejected" });
        expect(deps.findByHash).not.toHaveBeenCalled();
    });

    it("rejects X-API-Key by default and accepts only the Bearer header", async () => {
        const deps = dependencies(storedKey());
        const result = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { "X-API-Key": secret },
            }),
            "review_requests:write",
            deps,
        );

        expect(result).toMatchObject({ ok: false, status: 401 });
        expect(deps.findByHash).not.toHaveBeenCalled();
    });

    it("rejects missing scopes and rate-limited keys", async () => {
        const noScope = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "reviews:read",
            dependencies(storedKey()),
        );
        const limitedDeps = dependencies(storedKey());
        vi.mocked(limitedDeps.consumeRateLimit).mockResolvedValue("limited");
        const limited = await authenticateApiKeyRequest(
            new Request("https://app.example.com/api/webhooks/generic", {
                headers: { Authorization: `Bearer ${secret}` },
            }),
            "review_requests:write",
            limitedDeps,
        );

        expect(noScope).toMatchObject({ ok: false, status: 403, code: "insufficient_scope" });
        expect(limited).toMatchObject({ ok: false, status: 429, code: "rate_limited" });
    });
});

describe("API-key storage and visibility", () => {
    it("generates strong keys and builds a database record without plaintext", () => {
        const material = createApiKeyMaterial();
        const serializedRecord = JSON.stringify(material.storage);

        expect(material.secret).toMatch(/^zy_live_[A-Za-z0-9_-]{43}$/);
        expect(material.storage.keyHash).toMatch(/^[a-f0-9]{64}$/);
        expect(material.storage.keyPrefix).toMatch(/^zy_live_[A-Za-z0-9_-]{6}$/);
        expect(serializedRecord).not.toContain(material.secret);
    });

    it("serializes stored keys without a secret or hash", () => {
        const publicKey = toPublicApiKey({
            id: storedKey().id,
            name: "Zapier",
            key_prefix: "zy_live_ABC123",
            scopes: ["review_requests:write"],
            rate_limit_per_minute: 60,
            last_used_at: null,
            revoked_at: null,
            created_at: "2026-08-19T00:00:00.000Z",
        });

        expect(publicKey).not.toHaveProperty("apiKey");
        expect(publicKey).not.toHaveProperty("keyHash");
        expect(JSON.stringify(publicKey)).not.toContain(secret);
    });
});

describe("API-key management authorization", () => {
    it.each([
        ["owner", true],
        ["admin", true],
        ["manager", false],
        ["member", false],
        ["viewer", false],
        [null, false],
    ])("allows only owners/admins (%s)", (role, expected) => {
        expect(canManageApiKeys(role)).toBe(expected);
    });
});

describe("API-key rotation", () => {
    it("creates a replacement and revokes the old key", async () => {
        const create = vi.fn().mockResolvedValue({ key: { id: "new-key" }, apiKey: secret });
        const revoke = vi.fn().mockResolvedValue(true);
        const result = await performApiKeyRotation<{ key: { id: string }; apiKey: string }>({
            id: "old-key",
            businessId: storedKey().businessId,
            name: "Zapier",
            scopes: ["review_requests:write"],
            rateLimitPerMinute: 60,
            revokedAt: null,
        }, actorId, { create, revoke });

        expect(result?.apiKey).toBe(secret);
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ rotatedFromId: "old-key" }));
        expect(revoke).toHaveBeenCalledWith("old-key", actorId, "rotated");
    });

    it("revokes the replacement if the old key cannot be revoked", async () => {
        const create = vi.fn().mockResolvedValue({ key: { id: "new-key" } });
        const revoke = vi.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const result = await performApiKeyRotation({
            id: "old-key",
            businessId: storedKey().businessId,
            name: "Zapier",
            scopes: ["review_requests:write"],
            rateLimitPerMinute: 60,
            revokedAt: null,
        }, actorId, { create, revoke });

        expect(result).toBeNull();
        expect(revoke).toHaveBeenLastCalledWith("new-key", actorId, "manual");
    });
});
