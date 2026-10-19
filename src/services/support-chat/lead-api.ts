import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";

import { clientIpFrom } from "@/lib/auth/rate-limit";
import { logger } from "@/lib/logger";
import { supportChatLeadRateLimit } from "@/lib/support-chat/rate-limits";
import { supportChatLeadSchema } from "@/lib/support-chat/schemas";
import { sendEmail } from "@/services/resend/send-email";
import { supportChatLeadEmail } from "@/services/resend/templates/support-chat-lead-email";
import { openSlackThread } from "@/services/support-chat/slack/slack-relay";
import { ensureConversation, updateConversation } from "@/services/support-chat/store/conversation-store";
import { saveLead } from "@/services/support-chat/store/lead-store";
import type { SupportChatLead } from "@/lib/support-chat/schemas";

const DEFAULT_LEAD_INBOX = "zyene.inc@gmail.com";

function leadInbox(): string {
    return process.env.SUPPORT_CHAT_LEAD_INBOX?.trim() || DEFAULT_LEAD_INBOX;
}

/** Database copy + Slack thread; both best-effort so the email still goes out if either is down. */
async function recordLead(lead: SupportChatLead): Promise<void> {
    const conversation = await ensureConversation(lead.sessionId, lead.pagePath);
    if (conversation) {
        await updateConversation(conversation.id, { lead_name: lead.name, lead_email: lead.email });
        conversation.lead_name = lead.name;
    }
    await saveLead({
        conversationId: conversation?.id ?? null,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        businessType: lead.businessType,
        reason: lead.reason,
        pagePath: lead.pagePath,
    });
    if (conversation) {
        await openSlackThread(conversation, {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            businessType: lead.businessType,
            reason: lead.reason === "human_request" ? "asked to talk to a person" : "asked several questions",
            pagePath: lead.pagePath,
            transcript: lead.transcript,
        });
    }
}

export async function handleSupportChatLeadPost(request: Request): Promise<Response> {
    const verification = await checkBotId();
    if (verification.isBot) return NextResponse.json({ error: "Unable to save your details." }, { status: 403 });

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
        await recordLead(lead).catch((err: unknown) => logger.warn({ err }, "[support-chat] lead record failed"));
        logger.info({ sessionId: lead.sessionId, reason: lead.reason }, "[support-chat] lead captured");
        return NextResponse.json({ ok: true });
    } catch (err) {
        logger.error({ err, sessionId: lead.sessionId }, "[support-chat] lead email failed");
        return NextResponse.json({ error: "Unable to save your details. Please try again." }, { status: 500 });
    }
}
