import { NextResponse } from "next/server";

import { clientIpFrom } from "@/lib/auth/rate-limit";
import { logger } from "@/lib/logger";
import { looksLikePromptInjection, REFUSAL_INJECTION, REPLY_UNAVAILABLE } from "@/lib/support-chat/guardrails";
import {
    supportChatBurstRateLimit,
    supportChatDailyRateLimit,
    supportChatSessionRateLimit,
} from "@/lib/support-chat/rate-limits";
import { supportChatRequestSchema } from "@/lib/support-chat/schemas";
import { encodeStreamEvent, STREAM_CONTENT_TYPE, type SupportChatStreamEvent } from "@/lib/support-chat/stream-protocol";
import { streamSupportReply } from "@/services/support-chat/chat-stream";
import { mirrorToSlack } from "@/services/support-chat/slack/slack-relay";
import { activeHumanAgent, ensureConversation, insertMessage } from "@/services/support-chat/store/conversation-store";

const LIMIT_REPLY =
    "You've asked a lot of great questions! To keep going, leave your details and our team will follow up personally.";

function eventStream(run: (emit: (event: SupportChatStreamEvent) => void) => Promise<void>, status = 200): Response {
    const body = new ReadableStream<Uint8Array>({
        async start(controller) {
            const emit = (event: SupportChatStreamEvent) => controller.enqueue(encodeStreamEvent(event));
            try {
                await run(emit);
            } catch (err) {
                logger.error({ err }, "[support-chat] stream handler failed");
                emit({ type: "error", text: REPLY_UNAVAILABLE });
            } finally {
                controller.close();
            }
        },
    });
    return new Response(body, {
        status,
        headers: { "Content-Type": STREAM_CONTENT_TYPE, "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" },
    });
}

/** A complete canned answer, in the same stream format as a model reply. */
function cannedReply(text: string, intent: "answer" | "handoff" | "off_topic", status = 200): Response {
    return eventStream(async (emit) => {
        emit({ type: "delta", text });
        emit({ type: "meta", intent, suggestions: [], actions: [], open: null });
    }, status);
}

async function withinLimits(ip: string, sessionId: string): Promise<boolean> {
    const results = await Promise.all([
        supportChatBurstRateLimit.limit(ip),
        supportChatDailyRateLimit.limit(ip),
        supportChatSessionRateLimit.limit(sessionId),
    ]);
    return results.every((result) => result.success);
}

export async function handleSupportChatPost(request: Request): Promise<Response> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = supportChatRequestSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json({ error: "Please keep questions under 600 characters." }, { status: 400 });
    }
    const chat = parsed.data;

    try {
        if (!(await withinLimits(clientIpFrom(request), chat.sessionId))) return cannedReply(LIMIT_REPLY, "handoff", 429);
    } catch (err) {
        logger.error({ err }, "[support-chat] rate limit check failed");
        return cannedReply(REPLY_UNAVAILABLE, "answer", 503);
    }

    const question = chat.messages.at(-1)?.content ?? "";
    if (looksLikePromptInjection(question)) {
        logger.warn({ sessionId: chat.sessionId, length: question.length }, "[support-chat] injection attempt blocked");
        return cannedReply(REFUSAL_INJECTION, "off_topic");
    }

    return eventStream(async (emit) => {
        const conversation = await ensureConversation(chat.sessionId, chat.pagePath);
        if (conversation) await insertMessage(conversation.id, { role: "user", content: question });
        await mirrorToSlack(conversation, "visitor", question);

        // A team member is answering in Slack: relay only, no AI reply on top of theirs.
        const agentName = activeHumanAgent(conversation);
        if (agentName) {
            emit({ type: "human", agentName });
            return;
        }
        await streamSupportReply(chat, conversation, emit);
    });
}
