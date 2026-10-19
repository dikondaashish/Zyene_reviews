"use client";

import { SupportChatAgentBubble } from "@/components/marketing/support-chat/support-chat-agent-bubble";
import { SupportChatDemoCard } from "@/components/marketing/support-chat/support-chat-demo-card";
import { SupportChatReplyExtras } from "@/components/marketing/support-chat/support-chat-reply-extras";
import { SupportChatReputationCard } from "@/components/marketing/support-chat/support-chat-reputation-card";
import type { SupportChatController } from "@/hooks/use-support-chat";
import type { SupportChatActionKey } from "@/lib/support-chat/actions";
import { formatRelativeTime, type StoredChatMessage } from "@/lib/support-chat/client-storage";
import { SUPPORT_AGENT_NAME } from "@/lib/support-chat/constants";

export function AgentMeta({ at, name = SUPPORT_AGENT_NAME, label = "AI Agent" }: { at?: number; name?: string; label?: string }) {
    return <p className="support-chat-meta">{name} · {label} · {at ? formatRelativeTime(at) : "Just now"}</p>;
}

interface ThreadItemProps {
    message: StoredChatMessage;
    chat: SupportChatController;
    latest: boolean;
    /** Show the name/time line (last bubble in a run from the same speaker). */
    showMeta: boolean;
    onAction: (key: SupportChatActionKey) => void;
}

export function SupportChatThreadItem({ message, chat, latest, showMeta, onAction }: ThreadItemProps) {
    if (message.role === "user") {
        return (
            <div className="support-chat-group support-chat-group--user">
                <div className="support-chat-bubble support-chat-bubble--user"><p>{message.content}</p></div>
            </div>
        );
    }
    if (message.widget === "reputation") {
        return <SupportChatReputationCard message={message} sessionId={chat.sessionId} onResolve={chat.resolveWidget} />;
    }
    if (message.widget === "demo") {
        return (
            <SupportChatDemoCard
                message={message}
                sessionId={chat.sessionId}
                defaultName={chat.leadName}
                defaultEmail={chat.email}
                pagePath={chat.pagePath}
                onResolve={chat.resolveWidget}
            />
        );
    }

    const team = message.role === "agent" ? message.agentName ?? "Team" : undefined;
    const typing = chat.typingId === message.id;
    return (
        <div className="support-chat-group">
            <SupportChatAgentBubble
                text={message.content}
                animate={typing}
                complete={chat.streamingId !== message.id}
                onDone={chat.finishTyping}
                teamMember={team}
            />
            {!typing && !team ? (
                <SupportChatReplyExtras
                    message={message}
                    latest={latest}
                    onAction={onAction}
                    onSuggestion={chat.send}
                    onRate={chat.rateReply}
                />
            ) : null}
            {showMeta ? (team ? <AgentMeta at={message.createdAt} name={team} label="Zyene team" /> : <AgentMeta at={message.createdAt} />) : null}
        </div>
    );
}
