import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { type ResendEvent, getEmailId, normalizeResendEventType, verifyResendWebhook } from "./resend-webhook-utils";

export async function handleResendWebhook(request: Request) {
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

    const type = normalizeResendEventType(body.type);
    const emailId = getEmailId(body);
    if (!emailId || !type) {
        return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const patch: Record<string, unknown> = {};

    if (type === "email.delivered" || type === "delivered") {
        patch.delivered_at = nowIso;
    } else if (type === "email.opened" || type === "opened") {
        patch.opened_at = nowIso;
    } else if (type === "email.clicked" || type === "clicked") {
        patch.clicked_at = nowIso;
        patch.status = "clicked";
    } else if (type === "email.bounced" || type === "bounced") {
        patch.status = "failed";
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
