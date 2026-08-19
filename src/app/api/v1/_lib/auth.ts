import { NextResponse, type NextRequest } from "next/server";

import type { ApiKeyScope } from "@/lib/api-keys/scopes";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateStoredApiKey } from "@/services/api-keys/authenticate-api-key";

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

export function corsPreflight() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function withCors(response: NextResponse) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
    return response;
}

export async function authenticateApiKey(req: NextRequest, scope: ApiKeyScope) {
    const auth = await authenticateStoredApiKey(req, scope, { allowXApiKey: true });
    if (!auth.ok) {
        const error = {
            url_key_rejected: "API keys in URLs are not accepted. Use an authentication header.",
            unauthorized: "Missing or invalid API key. Use X-API-Key or a Bearer token.",
            insufficient_scope: `API key lacks ${scope} scope.`,
            rate_limited: "API rate limit exceeded.",
            authentication_unavailable: "API key authentication is temporarily unavailable.",
        }[auth.code];
        return {
            ok: false as const,
            response: withCors(
                NextResponse.json({ success: false, error }, { status: auth.status }),
            ),
        };
    }

    const business = await createAdminClient()
        .from("businesses")
        .select("id, name, slug")
        .eq("id", auth.businessId)
        .maybeSingle();
    return {
        ...auth,
        businessSlug: business.data?.slug ?? null,
        businessName: business.data?.name ?? null,
    };
}

export function authorizeAeoScope(req: NextRequest, scope: ApiKeyScope) {
    return authenticateApiKey(req, scope);
}
