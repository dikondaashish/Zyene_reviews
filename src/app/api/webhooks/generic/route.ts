/**
 * Generic incoming webhook (Zapier, Make, custom POS scripts).
 *
 * Auth: same Developer API key (zy_…) as `/api/v1/*`. Accept any of:
 *   - `?key=zy_…` query string (handy for Zapier, no header step)
 *   - `X-API-Key: zy_…`
 *   - `Authorization: Bearer zy_…`
 *
 * Body: lenient JSON. Accepts common field aliases so Zapier mappings just work:
 *   { name | customerName | first_name (+ last_name) }
 *   { email | customerEmail }
 *   { phone | customerPhone | mobile }
 *   { channel } — sms | email | link | both (default: auto-pick from fields)
 *
 * Behavior matches the dashboard send (limits, opt-outs, normalization,
 * partial success, customer counter bumps) via `sendOutboundReviewRequest`.
 */

import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendOutboundReviewRequest, type OutboundChannel } from "@/lib/review-requests/send-outbound";

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

function withCors(res: NextResponse): NextResponse {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
}

function extractApiKey(req: NextRequest): string | null {
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

async function authenticateKey(req: NextRequest) {
    const apiKey = extractApiKey(req);
    if (!apiKey || !apiKey.startsWith("zy_")) {
        return {
            ok: false as const,
            response: withCors(
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
            response: withCors(
                NextResponse.json({ success: false, error: "Unauthorized API key." }, { status: 401 }),
            ),
        };
    }

    return { ok: true as const, businessId: platform.business_id };
}

function pickString(...values: unknown[]): string | null {
    for (const v of values) {
        if (typeof v === "string") {
            const t = v.trim();
            if (t) return t;
        }
    }
    return null;
}

function normalizeChannel(
    raw: string | null,
    hasPhone: boolean,
    hasEmail: boolean,
): OutboundChannel | null {
    const v = (raw || "").trim().toLowerCase();
    if (v === "sms" || v === "email" || v === "link" || v === "both") return v;
    if (v === "" || v === "auto") {
        if (hasPhone && hasEmail) return "both";
        if (hasPhone) return "sms";
        if (hasEmail) return "email";
        return "link";
    }
    return null;
}

export async function OPTIONS() {
    return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
    const auth = await authenticateKey(req);
    if (!auth.ok) return auth.response;

    let body: Record<string, unknown> | null = null;
    try {
        const text = await req.text();
        body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
        return withCors(
            NextResponse.json(
                { success: false, error: "Invalid JSON payload." },
                { status: 400 },
            ),
        );
    }

    const first = pickString(body?.first_name, body?.firstName);
    const last = pickString(body?.last_name, body?.lastName);
    const fullFromParts = [first, last].filter(Boolean).join(" ").trim() || null;

    const customerName =
        pickString(body?.name, body?.customerName, body?.customer_name, body?.fullName) ||
        fullFromParts;

    const customerEmail = pickString(
        body?.email,
        body?.customerEmail,
        body?.customer_email,
        body?.emailAddress,
    );

    const customerPhone = pickString(
        body?.phone,
        body?.customerPhone,
        body?.customer_phone,
        body?.mobile,
        body?.phoneNumber,
    );

    const channelStr = pickString(body?.channel, body?.preferredChannel);
    const channel = normalizeChannel(channelStr, !!customerPhone, !!customerEmail);

    if (!channel) {
        return withCors(
            NextResponse.json(
                {
                    success: false,
                    error: "Invalid channel. Use 'sms', 'email', 'link', or 'both'.",
                },
                { status: 400 },
            ),
        );
    }

    if (!customerPhone && !customerEmail && channel !== "link") {
        return withCors(
            NextResponse.json(
                {
                    success: false,
                    error: "Provide a phone or email field (e.g. 'phone' / 'email' / 'name').",
                },
                { status: 400 },
            ),
        );
    }

    const result = await sendOutboundReviewRequest({
        businessId: auth.businessId,
        channel,
        customerName,
        customerPhone,
        customerEmail,
        triggerSource: "zapier",
    });

    if (!result.success) {
        return withCors(
            NextResponse.json(
                { success: false, error: result.errorMessage },
                { status: result.code },
            ),
        );
    }

    return withCors(
        NextResponse.json({
            success: true,
            data: {
                requestId: result.requestId,
                status: result.status,
                channel: result.channel,
                reviewLink: result.reviewLink,
                warning: result.errorMessage,
            },
        }),
    );
}
