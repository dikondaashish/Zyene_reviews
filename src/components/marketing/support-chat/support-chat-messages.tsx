"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { SupportChatAgentBubble } from "@/components/marketing/support-chat/support-chat-agent-bubble";
import { formatRelativeTime, type StoredChatMessage } from "@/lib/support-chat/client-storage";
import { SUPPORT_AGENT_NAME, SUPPORT_CHAT_GREETING, SUPPORT_CHAT_STARTERS } from "@/lib/support-chat/constants";

interface MessagesProps {
    messages: StoredChatMessage[];
    pending: boolean;
    /** The reply currently typing out, if any. */
    typingId: string | null;
    onTypingDone: () => void;
    onStarter: (text: string) => void;
    /** Rendered after the thread, e.g. the contact-details card. */
    footer?: ReactNode;
}

function AgentMeta({ at }: { at?: number }) {
    return (
        <p className="support-chat-meta">
            {SUPPORT_AGENT_NAME} · AI Agent · {at ? formatRelativeTime(at) : "Just now"}
        </p>
    );
}

export function SupportChatMessages({ messages, pending, typingId, onTypingDone, onStarter, footer }: MessagesProps) {
    const threadRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, [messages.length, pending, footer]);

    // Follow a reply as it types out, unless the visitor has scrolled up to reread.
    useEffect(() => {
        const thread = threadRef.current;
        if (!thread) return;
        const observer = new MutationObserver(() => {
            if (thread.scrollHeight - thread.scrollTop - thread.clientHeight < 120) thread.scrollTop = thread.scrollHeight;
        });
        observer.observe(thread, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={threadRef} className="support-chat-thread" aria-live="polite" aria-relevant="additions">
            <div className="support-chat-group">
                {SUPPORT_CHAT_GREETING.map((line) => (
                    <div key={line} className="support-chat-bubble support-chat-bubble--agent"><p>{line}</p></div>
                ))}
                <AgentMeta at={messages[0]?.createdAt} />
            </div>

            {messages.length === 0 ? (
                <div className="support-chat-starters" aria-label="Suggested questions">
                    {SUPPORT_CHAT_STARTERS.map((starter) => (
                        <button key={starter} type="button" onClick={() => onStarter(starter)}>{starter}</button>
                    ))}
                </div>
            ) : null}

            {messages.map((message, index) => {
                const isAgent = message.role === "assistant";
                const nextIsAgent = messages[index + 1]?.role === "assistant";
                return (
                    <div key={message.id} className={`support-chat-group${isAgent ? "" : " support-chat-group--user"}`}>
                        {isAgent ? (
                            <SupportChatAgentBubble text={message.content} animate={message.id === typingId} onDone={onTypingDone} />
                        ) : (
                            <div className="support-chat-bubble support-chat-bubble--user"><p>{message.content}</p></div>
                        )}
                        {isAgent && !nextIsAgent ? <AgentMeta at={message.createdAt} /> : null}
                    </div>
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
