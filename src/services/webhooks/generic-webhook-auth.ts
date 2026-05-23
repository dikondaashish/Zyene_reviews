import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { withGenericWebhookCors } from "./generic-webhook-cors";

export function extractGenericWebhookApiKey(req: NextRequest): string | null {
    const fromQuery = req.nextUrl.searchParams.get("key")?.trim();
    if (fromQuery) return fromQuery;
    const direct = req.headers.get("x-api-key")?.trim();
    if (direct) return direct;
    const auth = req.headers.get("authorization")?.trim();
    if (!auth) return null;
    const [scheme, token] = auth.split(" ");
    if (scheme?.toLowerCase() !== "bearer") return null;
    return token?.trim() || null;
}

export async function authenticateGenericWebhookKey(req: NextRequest) {
    const apiKey = extractGenericWebhookApiKey(req);
    if (!apiKey || !apiKey.startsWith("zy_")) {
        return {
            ok: false as const,
            response: withGenericWebhookCors(
                NextResponse.json(
                    {
                        success: false,
                        error: "Missing or invalid API key. Pass ?key=zy_… or X-API-Key header.",
                    },
                    { status: 401 },
                ),
            ),
        };
    }

    const admin = createAdminClient();
    const { data: platform } = await admin
        .from("review_platforms")
        .select("business_id")
        .eq("platform", "api")
        .eq("sync_status", "active")
        .eq("external_id", apiKey)
        .maybeSingle();

    if (!platform?.business_id) {
        return {
            ok: false as const,
            response: withGenericWebhookCors(
                NextResponse.json({ success: false, error: "Unauthorized API key." }, { status: 401 }),
            ),
        };
    }

    return { ok: true as const, businessId: platform.business_id };
}
