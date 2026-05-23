import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { Webhook } from "svix";

type ResendEvent = {
    type?: string;
    created_at?: string;
    data?: {
        email_id?: string;
        created_at?: string;
        [k: string]: unknown;
    };
    [k: string]: unknown;
};

function normalizeType(t: string | undefined): string {
    return (t || "").trim().toLowerCase();
}

function getEmailId(body: ResendEvent): string | null {
    const id = body?.data?.email_id;
    return typeof id === "string" && id.length > 0 ? id : null;
}

function verifyResendWebhook(rawPayload: string, request: Request): boolean {
    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!secret) return false;

    // Resend signs webhooks with Svix (`svix-id`, `svix-timestamp`, `svix-signature`).
    // The Resend Node SDK does not expose `resend.webhooks.verify`; use `svix` directly.
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (svixId && svixTimestamp && svixSignature) {
        try {
            const wh = new Webhook(secret);
            wh.verify(rawPayload, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature,
            });
            return true;
        } catch {
            return false;
        }
    }

    // Fallback: Bearer (manual tests / non-Svix proxies).
    const authHeader = request.headers.get("authorization");
    return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
    const raw = await request.text();
    const verified = verifyResendWebhook(raw, request);
    if (!verified) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: ResendEvent | null = null;
    try {
        body = JSON.parse(raw) as ResendEvent;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const type = normalizeType(body.type);
    const emailId = getEmailId(body);
    if (!emailId || !type) {
        return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const patch: Record<string, unknown> = {};

    // Resend: email.delivered, email.opened, email.clicked, email.bounced.
    // delivered/opened only set timestamps — never force status here, or events can arrive out of order
    // and overwrite funnel state (e.g. "clicked" from /api/track/review-open) with "delivered"/"opened".
    if (type === "email.delivered" || type === "delivered") {
        patch.delivered_at = nowIso;
    } else if (type === "email.opened" || type === "opened") {
        patch.opened_at = nowIso;
    } else if (type === "email.clicked" || type === "clicked") {
        patch.clicked_at = nowIso;
        patch.status = "clicked";
    } else if (type === "email.bounced" || type === "bounced") {
        patch.status = "failed";
        // try to capture bounce reason if present
        const reason =
            typeof (body.data as Record<string, unknown> | undefined)?.["error"] === "string"
                ? ((body.data as Record<string, unknown>)["error"] as string)
                : null;
        patch.error_message = reason ? `Email bounced: ${reason}` : "Email bounced";
    } else {
        return NextResponse.json({ ok: true, ignored: true, type });
    }

    const { data, error } = await admin
        .from("review_requests")
        .update(patch)
        .eq("resend_email_id", emailId)
        .select("id")
        .limit(5);

    if (error) {
        logger.error({ err: error }, "[webhooks/resend] update failed:");
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, matched: (data ?? []).length });
}

