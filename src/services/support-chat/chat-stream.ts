import { generateContentStreamWithFallback } from "@/domains/ai/adapters/vertex-stream";
import { logger } from "@/lib/logger";
import { REFUSAL_OFF_TOPIC, REPLY_UNAVAILABLE } from "@/lib/support-chat/guardrails";
import { DEFAULT_REPLY_META, parseReplyMeta } from "@/lib/support-chat/reply-meta";
import { searchSiteContent } from "@/lib/support-chat/retrieval/search-index";
import type { SupportChatRequest } from "@/lib/support-chat/schemas";
import { ReplyStreamGuard } from "@/lib/support-chat/stream-guard";
import type { SupportChatStreamEvent } from "@/lib/support-chat/stream-protocol";
import {
    buildSupportConversationPrompt,
    buildSupportSystemInstruction,
    retrievalQuery,
} from "@/lib/support-chat/system-prompt";
import { mirrorToSlack } from "@/services/support-chat/slack/slack-relay";
import { insertMessage } from "@/services/support-chat/store/conversation-store";
import type { ConversationRow } from "@/services/support-chat/store/support-chat-db";

type Emit = (event: SupportChatStreamEvent) => void;

/**
 * Generates Natalie's reply as a stream of guarded text deltas followed by one meta
 * event. Storage and Slack mirroring happen after the text, so they never slow
 * the first words down.
 */
export async function streamSupportReply(chat: SupportChatRequest, conversation: ConversationRow | null, emit: Emit) {
    const sources = searchSiteContent(retrievalQuery(chat), 4);
    const guard = new ReplyStreamGuard();
    let shown = "";
    const show = (text: string) => {
        if (!text) return;
        shown += text;
        emit({ type: "delta", text });
    };

    let failed = false;
    try {
        const stream = generateContentStreamWithFallback(buildSupportConversationPrompt(chat, sources), {
            systemInstruction: buildSupportSystemInstruction(),
            temperature: 0.3,
            maxOutputTokens: 700,
        });
        for await (const chunk of stream) {
            show(guard.push(chunk));
            if (guard.isBlocked) break;
        }
    } catch (err) {
        failed = true;
        logger.error({ err, sessionId: chat.sessionId }, "[support-chat] model stream failed");
    }

    const { text: rest, metaRaw, blocked } = guard.finish();
    show(rest);
    let meta = metaRaw ? parseReplyMeta(metaRaw) : DEFAULT_REPLY_META;
    let finalText = shown.trim();

    if (blocked || (!finalText && !failed)) {
        logger.warn({ sessionId: chat.sessionId, blocked }, "[support-chat] reply rejected by output guard");
        finalText = REPLY_UNAVAILABLE;
        meta = DEFAULT_REPLY_META;
        emit({ type: "replace", text: finalText });
    } else if (!finalText) {
        finalText = REPLY_UNAVAILABLE;
        emit({ type: "replace", text: finalText });
    } else if (meta.intent === "off_topic" && finalText.length > 400) {
        finalText = REFUSAL_OFF_TOPIC;
        emit({ type: "replace", text: finalText });
    }

    const messageId = conversation
        ? await insertMessage(conversation.id, {
              role: "assistant",
              content: finalText,
              intent: meta.intent,
              answered: failed ? false : meta.answered,
          })
        : null;
    emit({
        type: "meta",
        messageId: messageId ?? undefined,
        intent: meta.intent,
        suggestions: meta.suggestions,
        actions: meta.actions,
        open: meta.open,
    });
    await mirrorToSlack(conversation, "natalie", finalText);
}
