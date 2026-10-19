import { after, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { broadcastAgentMessage } from "@/services/support-chat/realtime";
import { postToSupportChannel, slackSupportConfig, slackUserFirstName, verifySlackSignature } from "@/services/support-chat/slack/slack-client";
import { findConversationByThread, insertMessage, updateConversation } from "@/services/support-chat/store/conversation-store";

/** Natalie stays quiet this long after each team reply. */
const TAKEOVER_MINUTES = 30;
/** Typed in a thread to hand the conversation back to Natalie right away. */
const HAND_BACK_COMMAND = /^!(ai|natalie)\b/i;

interface SlackMessageEvent {
    type?: string;
    subtype?: string;
    bot_id?: string;
    user?: string;
    text?: string;
    channel?: string;
    ts?: string;
    thread_ts?: string;
}

/** Slack formatting back to plain text for the visitor's chat bubble. */
function slackToPlain(text: string): string {
    return text
        .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2 ($1)")
        .replace(/<(https?:\/\/[^>]+)>/g, "$1")
        .replace(/<[@#!][^>]*>/g, "")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
        .trim();
}

async function handleThreadReply(event: SlackMessageEvent): Promise<void> {
    if (!event.channel || !event.thread_ts || !event.user || !event.text) return;
    const conversation = await findConversationByThread(event.channel, event.thread_ts);
    if (!conversation) return;

    if (HAND_BACK_COMMAND.test(event.text.trim())) {
        await updateConversation(conversation.id, { human_takeover_until: null });
        await postToSupportChannel(":robot_face: Natalie is answering again.", event.thread_ts);
        return;
    }

    const content = slackToPlain(event.text).slice(0, 2_000);
    if (!content) return;
    const agentName = await slackUserFirstName(event.user);
    const until = new Date(Date.now() + TAKEOVER_MINUTES * 60_000).toISOString();
    await updateConversation(conversation.id, { human_agent_name: agentName, human_takeover_until: until });
    const id = await insertMessage(conversation.id, { role: "agent", content, agent_name: agentName });
    await broadcastAgentMessage(conversation.session_id, {
        id: id ?? `${event.ts}`,
        agentName,
        content,
        createdAt: new Date().toISOString(),
    });
}

export async function handleSlackEvents(request: Request): Promise<Response> {
    if (!slackSupportConfig()) return NextResponse.json({ error: "Slack is not configured" }, { status: 404 });

    const raw = await request.text();
    const valid = verifySlackSignature(raw, request.headers.get("x-slack-request-timestamp"), request.headers.get("x-slack-signature"));
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    // Slack retries when we are slow; the first delivery is already being handled.
    if (request.headers.get("x-slack-retry-num")) return new NextResponse(null, { status: 200 });

    let payload: { type?: string; challenge?: string; event?: SlackMessageEvent };
    try {
        payload = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (payload.type === "url_verification") return NextResponse.json({ challenge: payload.challenge });

    const event = payload.event;
    const isHumanThreadReply =
        payload.type === "event_callback" &&
        event?.type === "message" &&
        !event.subtype &&
        !event.bot_id &&
        !!event.thread_ts &&
        event.thread_ts !== event.ts &&
        event.channel === slackSupportConfig()?.channel;

    if (isHumanThreadReply && event) {
        // Acknowledge within Slack's 3-second window; do the work after responding.
        after(() => handleThreadReply(event).catch((err: unknown) => logger.error({ err }, "[support-chat] Slack reply relay failed")));
    }
    return new NextResponse(null, { status: 200 });
}
