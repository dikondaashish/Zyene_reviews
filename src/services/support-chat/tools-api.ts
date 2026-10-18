import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import type { z } from "zod";

import { clientIpFrom } from "@/lib/auth/rate-limit";
import type { Ratelimit } from "@/lib/auth/fail-closed-rate-limit";
import { logger } from "@/lib/logger";
import {
    supportChatLeadRateLimit,
    supportChatReadRateLimit,
    supportChatToolRateLimit,
} from "@/lib/support-chat/rate-limits";
import {
    supportChatAgentMessagesSchema,
    supportChatDemoBookSchema,
    supportChatFeedbackSchema,
    supportChatReputationSchema,
} from "@/lib/support-chat/schemas";
import { bookDemo, fetchDemoSlots } from "@/lib/support-chat/tools/cal-com";
import { runReputationCheck, summarizeReputation } from "@/lib/support-chat/tools/reputation-check";
import { openSlackThread } from "@/services/support-chat/slack/slack-relay";
import { ensureConversation, listAgentMessages, setReplyFeedback, updateConversation } from "@/services/support-chat/store/conversation-store";
import { saveLead } from "@/services/support-chat/store/lead-store";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Fails closed: a limiter outage must not open a paid API or a booking form to abuse. */
async function overLimit(limiter: Ratelimit, key: string): Promise<Response | null> {
    try {
        const { success } = await limiter.limit(key);
        return success ? null : fail("Too many requests. Please try again in a few minutes.", 429);
    } catch (err) {
        logger.error({ err }, "[support-chat] rate limit check failed");
        return fail("Please try again in a moment.", 503);
    }
}

async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T> | Response> {
    try {
        const parsed = schema.safeParse(await request.json());
        return parsed.success ? parsed.data : fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    } catch {
        return fail("Invalid JSON", 400);
    }
}

export async function handleReputationCheck(request: Request): Promise<Response> {
    const body = await parseBody(request, supportChatReputationSchema);
    if (body instanceof Response) return body;
    const limited = await overLimit(supportChatToolRateLimit, clientIpFrom(request));
    if (limited) return limited;
    try {
        const result = await runReputationCheck(body.placeId);
        if (!result) return fail("I couldn't find that business on Google. Try another search?", 404);
        return NextResponse.json({ result, summary: summarizeReputation(result) });
    } catch (err) {
        logger.error({ err }, "[support-chat] reputation check failed");
        return fail("The rating lookup is unavailable right now.", 502);
    }
}

export async function handleDemoSlots(request: Request): Promise<Response> {
    const timeZone = new URL(request.url).searchParams.get("tz") ?? "America/Los_Angeles";
    if (!/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)*$/.test(timeZone) || timeZone.length > 64) return fail("Invalid time zone", 400);
    const limited = await overLimit(supportChatReadRateLimit, clientIpFrom(request));
    if (limited) return limited;
    try {
        return NextResponse.json({ days: await fetchDemoSlots(timeZone) });
    } catch (err) {
        logger.error({ err }, "[support-chat] demo slots failed");
        return NextResponse.json({ days: [] });
    }
}

export async function handleDemoBook(request: Request): Promise<Response> {
    const verification = await checkBotId();
    if (verification.isBot) return fail("Unable to book right now.", 403);
    const body = await parseBody(request, supportChatDemoBookSchema);
    if (body instanceof Response) return body;
    const limited = await overLimit(supportChatLeadRateLimit, clientIpFrom(request));
    if (limited) return limited;

    const booking = await bookDemo(body).catch((err: unknown) => {
        logger.error({ err }, "[support-chat] demo booking threw");
        return { ok: false as const, error: "Booking is unavailable right now." };
    });
    if (!booking.ok) return fail(booking.error, 409);

    const conversation = await ensureConversation(body.sessionId, body.pagePath);
    if (conversation) await updateConversation(conversation.id, { lead_name: body.name, lead_email: body.email });
    await saveLead({ conversationId: conversation?.id ?? null, name: body.name, email: body.email, reason: "demo_booking", pagePath: body.pagePath });
    if (conversation) {
        await openSlackThread(conversation, {
            name: body.name, email: body.email, reason: `booked a demo for ${body.start}`, pagePath: body.pagePath, transcript: [],
        });
    }
    logger.info({ sessionId: body.sessionId }, "[support-chat] demo booked");
    return NextResponse.json({ ok: true });
}

export async function handleReplyFeedback(request: Request): Promise<Response> {
    const body = await parseBody(request, supportChatFeedbackSchema);
    if (body instanceof Response) return body;
    const limited = await overLimit(supportChatReadRateLimit, clientIpFrom(request));
    if (limited) return limited;
    const saved = await setReplyFeedback(body.sessionId, body.messageId, body.rating);
    return NextResponse.json({ ok: saved });
}

export async function handleAgentMessages(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const parsed = supportChatAgentMessagesSchema.safeParse({ sessionId: params.get("sessionId"), since: params.get("since") });
    if (!parsed.success) return fail("Invalid request", 400);
    const limited = await overLimit(supportChatReadRateLimit, clientIpFrom(request));
    if (limited) return limited;
    const messages = await listAgentMessages(parsed.data.sessionId, parsed.data.since);
    return NextResponse.json({
        messages: messages.map((m) => ({ id: m.id, agentName: m.agent_name ?? "The team", content: m.content, createdAt: m.created_at })),
    });
}
