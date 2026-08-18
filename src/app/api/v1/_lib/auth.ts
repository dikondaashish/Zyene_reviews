import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { createHash } from "node:crypto";
import { redis } from "@/lib/db/redis";

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

export function corsPreflight() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function withCors(response: NextResponse) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    return response;
}

function extractApiKey(req: NextRequest): string | null {
    const direct = req.headers.get("x-api-key")?.trim();
    if (direct) return direct;
    const auth = req.headers.get("authorization")?.trim();
    if (!auth) return null;
    const [scheme, token] = auth.split(" ");
    if (scheme?.toLowerCase() !== "bearer") return null;
    return token?.trim() || null;
}

export async function authenticateApiKey(req: NextRequest): Promise<
    | {
          ok: true;
          businessId: string;
          businessSlug: string | null;
          businessName: string | null;
          scopes: string[];
          keyId: string | null;
      }
    | { ok: false; response: NextResponse }
> {
    const apiKey = extractApiKey(req);
    if (!apiKey || (!apiKey.startsWith("zy_") && !apiKey.startsWith("zyaeo_"))) {
        return {
            ok: false,
            response: withCors(
                NextResponse.json(
                    { success: false, error: "Missing or invalid API key. Use X-API-Key or Bearer token." },
                    { status: 401 }
                )
            ),
        };
    }

    const admin = createAdminClient();
    if (apiKey.startsWith("zyaeo_")) {
        const key = await admin.from("aeo_public_api_keys" as never)
            .select("id, business_id, scopes, rate_limit_per_minute, expires_at, revoked_at" as never)
            .eq("key_hash" as never, createHash("sha256").update(apiKey).digest("hex") as never)
            .maybeSingle() as unknown as { data: { id: string; business_id: string | null; scopes: string[]; rate_limit_per_minute: number; expires_at: string | null; revoked_at: string | null } | null; error: unknown };
        const expired = key.data?.expires_at && new Date(key.data.expires_at) <= new Date();
        if (key.error || !key.data?.business_id || key.data.revoked_at || expired) {
            return { ok: false, response: withCors(NextResponse.json({ success: false, error: "Unauthorized API key." }, { status: 401 })) };
        }
        const allowed = await withinRateLimit(key.data.id, key.data.rate_limit_per_minute);
        if (!allowed) return { ok: false, response: withCors(NextResponse.json({ success: false, error: "API rate limit exceeded." }, { status: 429 })) };
        const business = await admin.from("businesses").select("id, name, slug").eq("id", key.data.business_id).maybeSingle();
        await admin.from("aeo_public_api_keys" as never).update({ last_used_at: new Date().toISOString() } as never).eq("id" as never, key.data.id as never);
        return { ok: true, businessId: key.data.business_id, businessSlug: business.data?.slug ?? null, businessName: business.data?.name ?? null, scopes: key.data.scopes, keyId: key.data.id };
    }

    const { data: platform, error } = await admin
        .from("review_platforms")
        .select("business_id")
        .eq("platform", "api")
        .eq("sync_status", "active")
        .eq("external_id", apiKey)
        .maybeSingle();

    if (error || !platform?.business_id) {
        return {
            ok: false,
            response: withCors(
                NextResponse.json({ success: false, error: "Unauthorized API key." }, { status: 401 })
            ),
        };
    }

    const { data: business } = await admin
        .from("businesses")
        .select("id, name, slug")
        .eq("id", platform.business_id)
        .maybeSingle();

    return {
        ok: true,
        businessId: platform.business_id,
        businessSlug: business?.slug ?? null,
        businessName: business?.name ?? null,
        scopes: ["prompts:read", "results:read", "citations:read", "scores:read"],
        keyId: null,
    };
}

async function withinRateLimit(keyId: string, limit: number): Promise<boolean> {
    try {
        const minute = Math.floor(Date.now() / 60_000);
        const bucket = `aeo:api:${keyId}:${minute}`;
        const count = await redis.incr(bucket);
        if (count === 1) await redis.expire(bucket, 70);
        return count <= limit;
    } catch {
        return true;
    }
}

export async function authorizeAeoScope(req: NextRequest, scope: string) {
    const auth = await authenticateApiKey(req);
    if (!auth.ok) return auth;
    if (!auth.scopes.includes(scope)) {
        return { ok: false as const, response: withCors(NextResponse.json({ success: false, error: `API key lacks ${scope} scope.` }, { status: 403 })) };
    }
    return auth;
}
