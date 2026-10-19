import { SUPPORT_AGENT_NAME } from "@/lib/support-chat/constants";
import { postToSupportChannel, slackSupportConfig } from "@/services/support-chat/slack/slack-client";
import { updateConversation } from "@/services/support-chat/store/conversation-store";
import type { ConversationRow } from "@/services/support-chat/store/support-chat-db";

/** Slack mrkdwn treats <, > and & specially; visitor text must not form links or mentions. */
export function escapeSlack(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface SlackLeadSummary {
    name: string;
    email: string;
    phone?: string;
    businessType?: string;
    reason: string;
    pagePath?: string;
    transcript: Array<{ role: string; content: string }>;
}

/**
 * Starts the Slack thread that mirrors a conversation. Replies in the thread reach
 * the visitor's chat live; the AI pauses while a person is answering.
 */
export async function openSlackThread(conversation: ConversationRow, lead: SlackLeadSummary): Promise<void> {
    if (!slackSupportConfig() || conversation.slack_thread_ts) return;
    const header = [
        `:speech_balloon: *New website chat lead* — ${escapeSlack(lead.reason)}`,
        `*${escapeSlack(lead.name)}* · ${escapeSlack(lead.email)}${lead.phone ? ` · ${escapeSlack(lead.phone)}` : ""}`,
        lead.businessType ? `Business: ${escapeSlack(lead.businessType)}` : "",
        lead.pagePath ? `Page: ${escapeSlack(lead.pagePath)}` : "",
        "_Reply in this thread to chat with them live. Natalie pauses for 30 minutes after each reply._",
    ].filter(Boolean).join("\n");
    const parent = await postToSupportChannel(header);
    if (!parent) return;
    await updateConversation(conversation.id, { slack_channel_id: parent.channel, slack_thread_ts: parent.ts });
    conversation.slack_channel_id = parent.channel;
    conversation.slack_thread_ts = parent.ts;
    const transcript = lead.transcript
        .slice(-20)
        .map((m) => `*${m.role === "user" ? escapeSlack(lead.name) : m.role === "agent" ? "Team" : SUPPORT_AGENT_NAME}:* ${escapeSlack(m.content)}`)
        .join("\n");
    if (transcript) await postToSupportChannel(transcript, parent.ts);
}

/** Mirrors a new message into the conversation's thread, if it has one. */
export async function mirrorToSlack(conversation: ConversationRow | null, speaker: "visitor" | "natalie", text: string): Promise<void> {
    if (!conversation?.slack_thread_ts || !slackSupportConfig()) return;
    const label = speaker === "visitor" ? `*${escapeSlack(conversation.lead_name ?? "Visitor")}:*` : `:robot_face: *${SUPPORT_AGENT_NAME}:*`;
    await postToSupportChannel(`${label} ${escapeSlack(text)}`, conversation.slack_thread_ts);
}
