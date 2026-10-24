import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/db/supabase/server";
import { logger } from "@/lib/logger";
import { looksLikePromptInjection, REFUSAL_INJECTION, REPLY_UNAVAILABLE } from "@/lib/support-chat/guardrails";
import { supportChatBurstRateLimit, supportChatDailyRateLimit } from "@/lib/support-chat/rate-limits";
import { supportChatRequestSchema } from "@/lib/support-chat/schemas";
import { buildSetupAssistantInstruction, SUPPORT_EMAIL_ADDRESS } from "@/lib/support-chat/setup-assistant-prompt";
import { cannedReply, eventStream } from "@/services/support-chat/chat-api";
import { streamSupportReply } from "@/services/support-chat/chat-stream";
import { mirrorToSlack } from "@/services/support-chat/slack/slack-relay";
import { activeHumanAgent, ensureConversation, insertMessage } from "@/services/support-chat/store/conversation-store";

const setupAssistantSchema = supportChatRequestSchema.extend({ step: z.number().int().min(1).max(7) });

const LIMIT_REPLY = `You've asked a lot today. For anything else, email ${SUPPORT_EMAIL_ADDRESS} and a person will help.`;

/**
 * "Ask Zyene AI" during onboarding. Same engine, guards and Slack mirror as the website chat,
 * but only for signed-in owners, limited per account, and with setup-specific instructions.
 */
export async function handleSetupAssistantPost(request: Request): Promise<Response> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const parsed = setupAssistantSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please keep questions under 600 characters." }, { status: 400 });
    const chat = parsed.data;

    try {
        const key = `setup:${user.id}`;
        const results = await Promise.all([supportChatBurstRateLimit.limit(key), supportChatDailyRateLimit.limit(key)]);
        if (!results.every((r) => r.success)) return cannedReply(LIMIT_REPLY, "handoff", 429);
    } catch (err) {
        logger.error({ err }, "[setup-assistant] rate limit check failed");
        return cannedReply(REPLY_UNAVAILABLE, "answer", 503);
    }

    const question = chat.messages.at(-1)?.content ?? "";
    if (looksLikePromptInjection(question)) return cannedReply(REFUSAL_INJECTION, "off_topic");

    return eventStream(async (emit) => {
        const conversation = await ensureConversation(chat.sessionId, `/onboarding?step=${chat.step}`);
        if (conversation) await insertMessage(conversation.id, { role: "user", content: question });
        await mirrorToSlack(conversation, "visitor", `[setup · ${user.email ?? user.id}] ${question}`);

        // A team member took over in Slack: relay only.
        const agentName = activeHumanAgent(conversation);
        if (agentName) {
            emit({ type: "human", agentName });
            return;
        }
        await streamSupportReply(chat, conversation, emit, buildSetupAssistantInstruction(chat.step));
    });
}
