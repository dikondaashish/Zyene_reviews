import { hashApiKey } from "./credentials";
import type { ApiKeyScope } from "./scopes";

export type StoredApiKey = {
    id: string;
    businessId: string;
    scopes: string[];
    rateLimitPerMinute: number;
    expiresAt: string | null;
    revokedAt: string | null;
};

export type ApiKeyAuthDependencies = {
    findByHash: (keyHash: string) => Promise<StoredApiKey | null>;
    consumeRateLimit: (
        keyId: string,
        limitPerMinute: number,
    ) => Promise<"allowed" | "limited" | "unavailable">;
    markUsed: (keyId: string) => Promise<void>;
};

type AuthFailureCode =
    | "url_key_rejected"
    | "unauthorized"
    | "insufficient_scope"
    | "rate_limited"
    | "authentication_unavailable";

export type ApiKeyAuthentication =
    | { ok: true; businessId: string; scopes: string[]; keyId: string }
    | { ok: false; status: number; code: AuthFailureCode };

function bearerToken(request: Request, allowXApiKey: boolean): string | null {
    const authorization = request.headers.get("authorization")?.trim() ?? "";
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (match?.[1]) return match[1];
    if (!allowXApiKey) return null;
    return request.headers.get("x-api-key")?.trim() || null;
}

function looksLikeApiKey(secret: string): boolean {
    return /^(?:zy_live_|zyaeo_|zy_)[A-Za-z0-9_-]{32,}$/.test(secret);
}

export async function authenticateApiKeyRequest(
    request: Request,
    requiredScope: ApiKeyScope,
    dependencies: ApiKeyAuthDependencies,
    options: { allowXApiKey?: boolean; rejectUrlKey?: boolean } = {},
): Promise<ApiKeyAuthentication> {
    const url = new URL(request.url);
    if (options.rejectUrlKey !== false && url.searchParams.has("key")) {
        return { ok: false, status: 400, code: "url_key_rejected" };
    }

    const secret = bearerToken(request, options.allowXApiKey === true);
    if (!secret || !looksLikeApiKey(secret)) {
        return { ok: false, status: 401, code: "unauthorized" };
    }

    let key: StoredApiKey | null;
    try {
        key = await dependencies.findByHash(hashApiKey(secret));
    } catch {
        return { ok: false, status: 503, code: "authentication_unavailable" };
    }

    const expired = key?.expiresAt && new Date(key.expiresAt).getTime() <= Date.now();
    if (!key || key.revokedAt || expired) {
        return { ok: false, status: 401, code: "unauthorized" };
    }
    if (!key.scopes.includes(requiredScope)) {
        return { ok: false, status: 403, code: "insufficient_scope" };
    }

    const rateLimit = await dependencies.consumeRateLimit(key.id, key.rateLimitPerMinute);
    if (rateLimit === "limited") {
        return { ok: false, status: 429, code: "rate_limited" };
    }
    if (rateLimit === "unavailable") {
        return { ok: false, status: 503, code: "authentication_unavailable" };
    }

    try {
        await dependencies.markUsed(key.id);
    } catch {
        // Usage timestamps are operational metadata and must not break valid authentication.
    }
    return { ok: true, businessId: key.businessId, scopes: key.scopes, keyId: key.id };
}
