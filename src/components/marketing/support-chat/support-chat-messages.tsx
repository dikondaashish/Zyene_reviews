"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { AgentMeta, SupportChatThreadItem } from "@/components/marketing/support-chat/support-chat-thread-item";
import type { SupportChatController } from "@/hooks/use-support-chat";
import type { SupportChatActionKey } from "@/lib/support-chat/actions";
import { SUPPORT_AGENT_NAME, SUPPORT_CHAT_GREETING } from "@/lib/support-chat/constants";
import { getPageChatContext } from "@/lib/support-chat/page-context";

interface MessagesProps {
    chat: SupportChatController;
    onAction: (key: SupportChatActionKey) => void;
    /** Rendered after the thread, e.g. the contact-details card. */
    footer?: ReactNode;
}

/** Opening lines: a returning visitor is greeted by name; everyone else gets the page-aware opener. */
function greetingLines(chat: SupportChatController): string[] {
    const page = getPageChatContext(chat.pagePath);
    if (chat.leadName && chat.messages.length > 0) {
        return [`Hi ${chat.leadName}, welcome back! 👋 I'm ${SUPPORT_AGENT_NAME}, Zyene's AI agent.`, "Pick up where we left off, or ask me something new."];
    }
    return [SUPPORT_CHAT_GREETING[0], page.opener];
}

export function SupportChatMessages({ chat, onAction, footer }: MessagesProps) {
    const threadRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const { messages, pending } = chat;
    const starters = getPageChatContext(chat.pagePath).starters;

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, [messages.length, pending, footer]);

    // Follow a reply as it types out, unless the visitor has scrolled up to reread.
    useEffect(() => {
        const thread = threadRef.current;
        if (!thread) return;
        const observer = new MutationObserver(() => {
            if (thread.scrollHeight - thread.scrollTop - thread.clientHeight < 140) thread.scrollTop = thread.scrollHeight;
        });
        observer.observe(thread, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, []);

    const lastReplyIndex = messages.findLastIndex((m) => m.role !== "user" && !m.widget);

    return (
        <div ref={threadRef} className="support-chat-thread" aria-live="polite" aria-relevant="additions">
            <div className="support-chat-group">
                {greetingLines(chat).map((line) => (
                    <div key={line} className="support-chat-bubble support-chat-bubble--agent"><p>{line}</p></div>
                ))}
                <AgentMeta at={messages[0]?.createdAt} />
            </div>

            {messages.length === 0 ? (
                <div className="support-chat-starters" aria-label="Suggested questions">
                    {starters.map((starter) => (
                        <button key={starter} type="button" onClick={() => chat.send(starter)}>{starter}</button>
                    ))}
                </div>
            ) : null}

            {messages.map((message, index) => {
                const next = messages[index + 1];
                const sameSpeakerNext = next && next.role === message.role && !next.widget && next.agentName === message.agentName;
                return (
                    <SupportChatThreadItem
                        key={message.id}
                        message={message}
                        chat={chat}
                        latest={index === lastReplyIndex && index >= messages.length - 2}
                        showMeta={!sameSpeakerNext}
                        onAction={onAction}
                    />
                );
            })}

            {pending ? (
                <div className="support-chat-group">
                    <div className="support-chat-bubble support-chat-bubble--agent support-chat-typing" aria-label={`${SUPPORT_AGENT_NAME} is typing`}>
                        <span /><span /><span />
                    </div>
                </div>
            ) : null}

            {footer}
            <div ref={endRef} />
        </div>
    );
}
