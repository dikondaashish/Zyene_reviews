import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { type ResendEvent, getEmailId, normalizeResendEventType, verifyResendWebhook } from "./resend-webhook-utils";
import { applyResendFact, resendFact } from "./resend-delivery-apply";

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

    const fact = resendFact(type);
    if (!fact) {
        return NextResponse.json({ ok: true, ignored: true, type });
    }

    try {
        const matched = await applyResendFact(createAdminClient(), {
            emailId, fact, data: body.data as Record<string, unknown> | undefined,
        });
        return NextResponse.json({ ok: true, matched });
    } catch (error) {
        logger.error({ err: error }, "[webhooks/resend] update failed:");
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
}
