import { beforeEach, describe, expect, it, vi } from "vitest";

const management = vi.hoisted(() => ({
    authorizeApiKeyManagement: vi.fn(),
    createManagedApiKey: vi.fn(),
    findApiKeyForManagement: vi.fn(),
    revokeManagedApiKey: vi.fn(),
    rotateManagedApiKey: vi.fn(),
}));

vi.mock("@/services/api-keys/manage-api-keys", () => management);

import * as apiKeyRoute from "@/app/api/integrations/api-key/route";

const businessId = "22222222-2222-4222-8222-222222222222";
const keyId = "11111111-1111-4111-8111-111111111111";
const actor = { id: "33333333-3333-4333-8333-333333333333" };
const secret = "zy_live_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";
const key = {
    id: keyId,
    name: "Developer API",
    keyPrefix: "zy_live_abcdef",
    scopes: ["review_requests:write"],
    rateLimitPerMinute: 60,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: "2026-08-19T00:00:00.000Z",
};
const storedKey = {
    id: keyId,
    organization_id: "44444444-4444-4444-8444-444444444444",
    business_id: businessId,
    name: key.name,
    key_prefix: key.keyPrefix,
    scopes: key.scopes,
    rate_limit_per_minute: 60,
    last_used_at: null,
    revoked_at: null,
    created_at: key.createdAt,
};

function request(method: string, body: unknown) {
    return new Request("https://app.example.com/api/integrations/api-key", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("API-key management route", () => {
    beforeEach(() => vi.clearAllMocks());

    it("does not create keys for a non-owner/admin", async () => {
        management.authorizeApiKeyManagement.mockResolvedValue({ ok: false, status: 403 });
        const response = await apiKeyRoute.POST(request("POST", {
            businessId,
            scopes: ["review_requests:write"],
        }));

        expect(response.status).toBe(403);
        expect(management.createManagedApiKey).not.toHaveBeenCalled();
    });

    it("returns a rotated secret once and never exposes it in stored metadata", async () => {
        management.findApiKeyForManagement.mockResolvedValue(storedKey);
        management.authorizeApiKeyManagement.mockResolvedValue({ ok: true, user: actor });
        management.rotateManagedApiKey.mockResolvedValue({ apiKey: secret, key });

        const response = await apiKeyRoute.PATCH(request("PATCH", { keyId }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(body.apiKey).toBe(secret);
        expect(JSON.stringify(body.key)).not.toContain(secret);
        expect(apiKeyRoute).not.toHaveProperty("GET");
        expect(management.rotateManagedApiKey).toHaveBeenCalledWith(storedKey, actor.id);
    });

    it("revokes an owned key without returning a secret", async () => {
        management.findApiKeyForManagement.mockResolvedValue(storedKey);
        management.authorizeApiKeyManagement.mockResolvedValue({ ok: true, user: actor });
        management.revokeManagedApiKey.mockResolvedValue(true);

        const response = await apiKeyRoute.DELETE(request("DELETE", { keyId }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ revoked: true });
        expect(JSON.stringify(body)).not.toContain(secret);
        expect(management.revokeManagedApiKey).toHaveBeenCalledWith(keyId, actor.id, "manual");
    });
});
