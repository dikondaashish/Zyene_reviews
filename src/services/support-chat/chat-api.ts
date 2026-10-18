import { NextResponse } from "next/server";
import { Type as SchemaType, type Schema } from "@google/genai";

import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import { clientIpFrom } from "@/lib/auth/rate-limit";
import { logger } from "@/lib/logger";
import type { SupportChatIntent } from "@/lib/support-chat/constants";
import {
    looksLikePromptInjection,
    REFUSAL_INJECTION,
    REFUSAL_OFF_TOPIC,
    REPLY_UNAVAILABLE,
    sanitizeReply,
} from "@/lib/support-chat/guardrails";
import {
    supportChatBurstRateLimit,
    supportChatDailyRateLimit,
    supportChatSessionRateLimit,
} from "@/lib/support-chat/rate-limits";
import { supportChatRequestSchema } from "@/lib/support-chat/schemas";
import { buildSupportConversationPrompt, buildSupportSystemInstruction } from "@/lib/support-chat/system-prompt";

const replySchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        intent: { type: SchemaType.STRING, enum: ["answer", "handoff", "off_topic"] },
        reply: { type: SchemaType.STRING },
    },
    required: ["intent", "reply"],
};

type ChatReply = { reply: string; intent: SupportChatIntent };

const reply = (body: ChatReply, status = 200) => NextResponse.json(body, { status });

async function withinLimits(ip: string, sessionId: string): Promise<boolean> {
    const results = await Promise.all([
        supportChatBurstRateLimit.limit(ip),
        supportChatDailyRateLimit.limit(ip),
        supportChatSessionRateLimit.limit(sessionId),
    ]);
    return results.every((result) => result.success);
}

function parseModelReply(raw: string): ChatReply | null {
    try {
        const parsed = JSON.parse(raw) as Partial<ChatReply>;
        const intent: SupportChatIntent =
            parsed.intent === "handoff" || parsed.intent === "off_topic" ? parsed.intent : "answer";
        const text = typeof parsed.reply === "string" ? sanitizeReply(parsed.reply) : null;
        if (!text) return null;
        return { intent, reply: intent === "off_topic" && text.length > 400 ? REFUSAL_OFF_TOPIC : text };
    } catch {
        return null;
    }
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
        if (!(await withinLimits(clientIpFrom(request), chat.sessionId))) {
            return reply({
                intent: "handoff",
                reply: "You've asked a lot of great questions! To keep going, leave your details and our team will follow up personally.",
            }, 429);
        }
    } catch (err) {
        logger.error({ err }, "[support-chat] rate limit check failed");
        return reply({ intent: "answer", reply: REPLY_UNAVAILABLE }, 503);
    }

    const question = chat.messages.at(-1)?.content ?? "";
    if (looksLikePromptInjection(question)) {
        logger.warn({ sessionId: chat.sessionId, length: question.length }, "[support-chat] injection attempt blocked");
        return reply({ intent: "off_topic", reply: REFUSAL_INJECTION });
    }

    try {
        const output = await generateContentWithFallback(buildSupportConversationPrompt(chat), {
            systemInstruction: buildSupportSystemInstruction(),
            requireJson: true,
            schema: replySchema,
            temperature: 0.3,
            maxOutputTokens: 600,
        });
        const answer = parseModelReply(output);
        if (!answer) {
            logger.warn({ sessionId: chat.sessionId }, "[support-chat] reply rejected by output guard");
            return reply({ intent: "answer", reply: REPLY_UNAVAILABLE });
        }
        return reply(answer);
    } catch (err) {
        logger.error({ err, sessionId: chat.sessionId }, "[support-chat] model call failed");
        return reply({ intent: "answer", reply: REPLY_UNAVAILABLE }, 502);
    }
}
