import { NextResponse } from "next/server";

import { clientIpFrom } from "@/lib/auth/rate-limit";
import { logger } from "@/lib/logger";
import { supportChatLeadRateLimit } from "@/lib/support-chat/rate-limits";
import { supportChatLeadSchema } from "@/lib/support-chat/schemas";
import { sendEmail } from "@/services/resend/send-email";
import { supportChatLeadEmail } from "@/services/resend/templates/support-chat-lead-email";

const DEFAULT_LEAD_INBOX = "zyene.inc@gmail.com";

function leadInbox(): string {
    return process.env.SUPPORT_CHAT_LEAD_INBOX?.trim() || DEFAULT_LEAD_INBOX;
}

export async function handleSupportChatLeadPost(request: Request): Promise<Response> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = supportChatLeadSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Please check your details" },
            { status: 400 },
        );
    }
    const lead = parsed.data;

    // Honeypot filled: look successful so the bot moves on, but send nothing.
    if (lead.company) return NextResponse.json({ ok: true });

    // Fails closed: an unreachable limiter must not turn this into an open relay.
    try {
        const { success } = await supportChatLeadRateLimit.limit(clientIpFrom(request));
        if (!success) {
            return NextResponse.json({ error: "Thanks! We already have your details." }, { status: 429 });
        }
    } catch (err) {
        logger.error({ err }, "[support-chat] lead rate limit check failed");
        return NextResponse.json({ error: "Unable to save your details. Please try again." }, { status: 503 });
    }

    try {
        const { subject, html } = supportChatLeadEmail(lead);
        const result = await sendEmail({
            to: leadInbox(),
            subject,
            html,
            replyTo: lead.email,
            idempotencyKey: `support-chat-lead/${lead.sessionId}/${lead.email.toLowerCase()}`,
        });
        if (!result.sent) throw new Error(result.error ?? "Email not sent");
        logger.info({ sessionId: lead.sessionId, reason: lead.reason }, "[support-chat] lead captured");
        return NextResponse.json({ ok: true });
    } catch (err) {
        logger.error({ err, sessionId: lead.sessionId }, "[support-chat] lead email failed");
        return NextResponse.json({ error: "Unable to save your details. Please try again." }, { status: 500 });
    }
}
