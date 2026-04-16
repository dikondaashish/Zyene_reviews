import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";

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
      }
    | { ok: false; response: NextResponse }
> {
    const apiKey = extractApiKey(req);
    if (!apiKey || !apiKey.startsWith("zy_")) {
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
    };
}
