import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { resend } from "@/services/resend/client";

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

async function verifyResendWebhook(rawPayload: string, request: Request): Promise<boolean> {
    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!secret) return false;

    // Preferred: Svix signature verification (Resend docs).
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    const maybeVerify = (resend as unknown as { webhooks?: { verify?: (args: unknown) => unknown } })?.webhooks?.verify;
    if (typeof maybeVerify === "function" && svixId && svixTimestamp && svixSignature) {
        try {
            const ok = maybeVerify({
                payload: rawPayload,
                headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
                webhookSecret: secret,
            });
            return ok === true;
        } catch {
            return false;
        }
    }

    // Fallback: simple bearer secret (less secure, but avoids silently breaking).
    const authHeader = request.headers.get("authorization");
    return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
    const raw = await request.text();
    const verified = await verifyResendWebhook(raw, request);
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

    // Resend event types docs: e.g. "email.delivered", "email.opened", "email.clicked", "email.bounced".
    if (type === "email.delivered" || type === "delivered") {
        patch.delivered_at = nowIso;
        patch.status = "delivered";
    } else if (type === "email.opened" || type === "opened") {
        patch.opened_at = nowIso;
        // Only bump status upward if not terminal; simplest: set opened.
        patch.status = "opened";
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
        console.error("[webhooks/resend] update failed:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, matched: (data ?? []).length });
}

